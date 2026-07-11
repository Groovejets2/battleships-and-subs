import { applyTextQuality } from './textQuality.js';

/**
 * Shared rounded menu button styling for scene-level navigation and actions.
 */

/**
 * Create a rounded metallic button matching the title screen style.
 * @param {Phaser.Scene} scene
 * @param {object} options
 * @returns {{container: Phaser.GameObjects.Container, panel: Phaser.GameObjects.Image, text: Phaser.GameObjects.Text, hitArea: Phaser.GameObjects.Zone}}
 */
export function createRoundedMenuButton(scene, options) {
    const {
        x,
        y,
        width,
        height,
        label,
        onClick,
        accent = 0xcdd4da,
        fill = 0x3e4953,
        hoverFill = 0x66727c,
        inset = 0x141b22,
        hoverAccent = 0xf3f6f9,
        hoverInset = 0x1e252b,
        fontFamily = 'Arial Black',
        textFill = '#f5f7fa',
        letterSpacing = 1,
        fontSize = 18,
        depth = 25,
        interactive = true,
        useHandCursor = true
    } = options;

    const container = scene.add.container(x, y).setDepth(depth);
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x04070a, 0.35);
    shadow.fillRoundedRect(-width / 2 + 4, -height / 2 + 6, width, height, 18);

    const normalTexture = ensureRoundedButtonTexture(scene, {
        key: `${label}-normal`,
        width,
        height,
        fill,
        accent,
        inset
    });
    const hoverTexture = ensureRoundedButtonTexture(scene, {
        key: `${label}-hover`,
        width,
        height,
        fill: hoverFill,
        accent: hoverAccent,
        inset: hoverInset
    });

    const panel = scene.add.image(0, 0, normalTexture);
    panel.setDisplaySize(width, height);

    const text = scene.add.text(0, 0, label, {
        fontSize: `${fontSize}px`,
        fontFamily,
        fill: textFill,
        fontWeight: 'bold',
        letterSpacing
    }).setOrigin(0.5);
    applyTextQuality(text, 5);

    const hitArea = scene.add.zone(0, 0, width, height);
    container.add([shadow, panel, text, hitArea]);

    if (interactive) {
        hitArea.setInteractive({ useHandCursor });

        hitArea.on('pointerover', () => {
            panel.setTexture(hoverTexture);
            scene.tweens.add({
                targets: container,
                scaleX: 1.03,
                scaleY: 1.03,
                duration: 140,
                ease: 'Sine.Out'
            });
        });

        hitArea.on('pointerout', () => {
            panel.setTexture(normalTexture);
            scene.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 140,
                ease: 'Sine.Out'
            });
        });

        hitArea.on('pointerdown', () => {
            scene.tweens.add({
                targets: container,
                scaleX: 0.97,
                scaleY: 0.97,
                duration: 100,
                yoyo: true
            });
            if (onClick) {
                onClick();
            }
        });
    }

    return { container, panel, text, hitArea };
}

/**
 * Build a high-resolution texture for a rounded metallic button.
 * @param {Phaser.Scene} scene
 * @param {object} options
 * @returns {string}
 */
function ensureRoundedButtonTexture(scene, options) {
    const { key, width, height, fill, accent, inset } = options;
    const textureKey = `ui-rounded-button-${key}-${Math.round(width)}x${Math.round(height)}`;
    if (scene.textures.exists(textureKey)) {
        return textureKey;
    }

    const scale = 4;
    const texWidth = Math.round(width * scale);
    const texHeight = Math.round(height * scale);
    const radius = 18 * scale;
    const innerInset = 5 * scale;

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(fill, 1);
    graphics.fillRoundedRect(0, 0, texWidth, texHeight, radius);
    graphics.lineStyle(3 * scale, accent, 0.98);
    graphics.strokeRoundedRect(0, 0, texWidth, texHeight, radius);
    graphics.lineStyle(2 * scale, inset, 0.92);
    graphics.strokeRoundedRect(
        innerInset,
        innerInset,
        texWidth - (innerInset * 2),
        texHeight - (innerInset * 2),
        radius - (innerInset * 0.7)
    );
    graphics.fillStyle(0xffffff, 0.12);
    graphics.fillRoundedRect(
        texWidth * 0.08,
        texHeight * 0.12,
        texWidth * 0.84,
        texHeight * 0.28,
        12 * scale
    );
    graphics.generateTexture(textureKey, texWidth, texHeight);
    graphics.destroy();

    return textureKey;
}
