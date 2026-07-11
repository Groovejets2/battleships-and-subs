/**
 * Shared helpers for sharper Phaser text across the project.
 */

export function getTextResolution(scene, fallback = 4) {
    const dpr = scene?.game?.config?.resolution || window.devicePixelRatio || 1;
    return Math.max(fallback, Math.min(5, Math.ceil(dpr * 2)));
}

export function applyTextQuality(target, resolution) {
    if (!target) return target;

    const list = Array.isArray(target) ? target : [target];
    const resolved = resolution || getTextResolution(list[0]?.scene);

    list.forEach((item) => {
        if (item && typeof item.setResolution === 'function') {
            item.setResolution(resolved);
        }
    });

    return target;
}
