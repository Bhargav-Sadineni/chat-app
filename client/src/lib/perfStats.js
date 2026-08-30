// Lightweight in-browser performance tracker.
// Records raw samples per metric and prints running avg/min/max.
// Access anytime from DevTools console: window.__perfStats.summary()

const stats = {};

const record = (name, valueMs) => {
    if (!stats[name]) stats[name] = [];
    stats[name].push(valueMs);
    console.log(`[perf] ${name}: ${valueMs.toFixed(1)}ms  (n=${stats[name].length})`);
};

const summary = () => {
    Object.entries(stats).forEach(([name, values]) => {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        console.log(
            `%c${name}%c — n=${values.length}, avg=${avg.toFixed(1)}ms, min=${min.toFixed(1)}ms, max=${max.toFixed(1)}ms`,
            "font-weight:bold", ""
        );
    });
    if (Object.keys(stats).length === 0) {
        console.log("No metrics recorded yet — use the app for a bit first (send messages, make calls, ask the AI something).");
    }
};

const reset = () => {
    Object.keys(stats).forEach((k) => delete stats[k]);
};

export const perfStats = { record, summary, reset };

if (typeof window !== "undefined") {
    window.__perfStats = perfStats;
}