import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./Authcontext";

export const CallContext = createContext();

const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const CallProvider = ({ children }) => {
    const { socket, authUser } = useContext(AuthContext);

    const [callState, setCallState] = useState("idle"); // idle | ringing-outgoing | ringing-incoming | in-call
    const [incomingCall, setIncomingCall] = useState(null);
    const [currentCall, setCurrentCall] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({}); // userId -> MediaStream
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);

    const peersRef = useRef({}); // userId -> RTCPeerConnection
    const localStreamRef = useRef(null);
    const currentCallRef = useRef(null);
    const incomingCallRef = useRef(null);
    const pendingCandidatesRef = useRef({}); // userId -> [candidate,...]

    useEffect(() => { currentCallRef.current = currentCall; }, [currentCall]);
    useEffect(() => { incomingCallRef.current = incomingCall; }, [incomingCall]);
    useEffect(() => { localStreamRef.current = localStream; }, [localStream]);

    const cleanupPeer = (userId) => {
        const pc = peersRef.current[userId];
        if (pc) {
            pc.close();
            delete peersRef.current[userId];
        }
        setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[userId];
            return next;
        });
    };

    const cleanupCall = () => {
        Object.keys(peersRef.current).forEach(cleanupPeer);
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop());
        }
        setLocalStream(null);
        setRemoteStreams({});
        setIncomingCall(null);
        setCurrentCall(null);
        setCallState("idle");
        setMuted(false);
        setCameraOff(false);
        pendingCandidatesRef.current = {};
    };

    const getMedia = async (type) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: type === "video",
        });
        setLocalStream(stream);
        localStreamRef.current = stream;
        return stream;
    };

    const createPeerConnection = (otherUserId, callId) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        pc.ontrack = (event) => {
            setRemoteStreams((prev) => ({ ...prev, [otherUserId]: event.streams[0] }));
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("call:signal", {
                    callId,
                    toUserId: otherUserId,
                    data: { kind: "candidate", candidate: event.candidate },
                });
            }
        };

        peersRef.current[otherUserId] = pc;
        return pc;
    };

    const connectToPeer = async (otherUserId, callId, isInitiator) => {
        if (peersRef.current[otherUserId]) return;
        const pc = createPeerConnection(otherUserId, callId);

        if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("call:signal", {
                callId,
                toUserId: otherUserId,
                data: { kind: "offer", sdp: offer },
            });
        }
    };

    // ---- Outgoing call ----
    const startCall = async (type, { userId, groupId, groupName, targetName }) => {
        try {
            await getMedia(type);
            const callId = `${Date.now()}-${authUser._id}`;

            setCurrentCall({
                callId,
                type,
                isGroup: !!groupId,
                groupId: groupId || null,
                groupName: groupName || null,
                targetName: targetName || null,
                participants: [{ userId: authUser._id, fullName: authUser.fullName, profilePic: authUser.profilePic }],
            });
            setCallState("ringing-outgoing");

            socket.emit("call:initiate", {
                callId,
                type,
                targetUserId: userId,
                groupId: groupId || undefined,
            });
        } catch (err) {
            toast.error("Couldn't access camera/microphone.");
        }
    };

    // ---- Incoming call ----
    const acceptCall = async () => {
        const call = incomingCallRef.current;
        if (!call) return;
        try {
            await getMedia(call.type);
            setCurrentCall({
                callId: call.callId,
                type: call.type,
                isGroup: call.isGroup,
                groupId: call.groupId,
                groupName: call.groupName,
                targetName: call.caller.fullName,
                participants: [],
            });
            setCallState("in-call");
            socket.emit("call:accept", { callId: call.callId });
            setIncomingCall(null);
        } catch (err) {
            toast.error("Couldn't access camera/microphone.");
        }
    };

    const rejectCall = () => {
        const call = incomingCallRef.current;
        if (!call) return;
        socket.emit("call:reject", { callId: call.callId });
        setIncomingCall(null);
    };

    const endCall = () => {
        const call = currentCallRef.current;
        if (call) {
            socket.emit("call:leave", { callId: call.callId });
        }
        cleanupCall();
    };

    const toggleMute = () => {
        if (!localStreamRef.current) return;
        const newMuted = !muted;
        localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !newMuted));
        setMuted(newMuted);
    };

    const toggleCamera = () => {
        if (!localStreamRef.current) return;
        const newCameraOff = !cameraOff;
        localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !newCameraOff));
        setCameraOff(newCameraOff);
    };

    // ---- Socket listeners ----
    useEffect(() => {
        if (!socket) return;

        socket.on("call:incoming", (payload) => {
            if (currentCallRef.current) {
                // Already in a call — auto-decline
                socket.emit("call:reject", { callId: payload.callId });
                return;
            }
            setIncomingCall(payload);
            setCallState("ringing-incoming");
        });

        socket.on("call:unavailable", ({ callId }) => {
            if (currentCallRef.current?.callId === callId) {
                toast.error("They're not available right now.");
                cleanupCall();
            }
        });

        socket.on("call:rejected", ({ callId }) => {
            if (currentCallRef.current?.callId !== callId) return;
            if (!currentCallRef.current.isGroup) {
                toast("Call declined", { icon: "📵" });
                cleanupCall();
            }
        });

        socket.on("call:participants-update", ({ callId, participants }) => {
            if (currentCallRef.current?.callId !== callId) return;

            setCurrentCall((prev) => (prev ? { ...prev, participants } : prev));
            setCallState("in-call");

            participants.forEach((p) => {
                if (p.userId === authUser._id) return;
                if (peersRef.current[p.userId]) return;
                const isInitiator = authUser._id < p.userId;
                connectToPeer(p.userId, callId, isInitiator);
            });
        });

        socket.on("call:signal", async ({ callId, fromUserId, data }) => {
            let pc = peersRef.current[fromUserId];
            if (!pc) {
                pc = createPeerConnection(fromUserId, callId);
            }

            if (data.kind === "offer") {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("call:signal", {
                    callId,
                    toUserId: fromUserId,
                    data: { kind: "answer", sdp: answer },
                });
                (pendingCandidatesRef.current[fromUserId] || []).forEach((c) => pc.addIceCandidate(new RTCIceCandidate(c)));
                pendingCandidatesRef.current[fromUserId] = [];
            } else if (data.kind === "answer") {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                (pendingCandidatesRef.current[fromUserId] || []).forEach((c) => pc.addIceCandidate(new RTCIceCandidate(c)));
                pendingCandidatesRef.current[fromUserId] = [];
            } else if (data.kind === "candidate") {
                if (pc.remoteDescription && pc.remoteDescription.type) {
                    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } else {
                    pendingCandidatesRef.current[fromUserId] = pendingCandidatesRef.current[fromUserId] || [];
                    pendingCandidatesRef.current[fromUserId].push(data.candidate);
                }
            }
        });

        socket.on("call:peer-left", ({ callId, userId: leftUserId }) => {
            if (currentCallRef.current?.callId !== callId) return;
            cleanupPeer(leftUserId);
            setCurrentCall((prev) =>
                prev ? { ...prev, participants: prev.participants.filter((p) => p.userId !== leftUserId) } : prev
            );
        });

        socket.on("call:ended", ({ callId }) => {
            if (currentCallRef.current?.callId === callId || incomingCallRef.current?.callId === callId) {
                toast("Call ended", { icon: "📴" });
                cleanupCall();
            }
        });

        return () => {
            socket.off("call:incoming");
            socket.off("call:unavailable");
            socket.off("call:rejected");
            socket.off("call:participants-update");
            socket.off("call:signal");
            socket.off("call:peer-left");
            socket.off("call:ended");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, authUser]);

    const value = {
        callState,
        incomingCall,
        currentCall,
        localStream,
        remoteStreams,
        muted,
        cameraOff,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
    };

    return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};