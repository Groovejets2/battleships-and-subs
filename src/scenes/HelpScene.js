/**
 * @fileoverview HelpScene - Arcade-style help hub plus sub-pages.
 * Uses the same tiled wave background as the combat scene and matches the combat font treatment.
 */

import { createRoundedMenuButton } from '../utils/uiButtons.js';

const HELP_FONT_FAMILY = 'Copperplate, "Palatino Linotype", Georgia, serif';
const HELP_TEXT_FILL = '#f5f7fa';
const HELP_TEXT_STROKE = '#12181f';
const HELP_CHROME_ACCENT = 0xcdd4da;
const HELP_CHROME_FILL = 0x2b343c;
const HELP_CHROME_INSET = 0x141b22;

function ensureHelpAssets(scene) {
    if (!scene.textures.exists('help-wave-tile')) {
        scene.load.image('help-wave-tile', 'src/images/battleships-and-subs-game-screen-01.jpg');
    }
    if (!scene.textures.exists('ship-icon-safe')) {
        scene.load.image('ship-icon-safe', 'src/images/Ship-Icon-01-Safe.png');
    }
    if (!scene.textures.exists('ship-icon-hit')) {
        scene.load.image('ship-icon-hit', 'src/images/Ship-Icon-02-Hit.png');
    }
    // Ship hull sprites (used for help fleet line-up previews).
    if (!scene.textures.exists('ship-carrier')) {
        scene.load.image('ship-carrier', 'assets/ships/Carrier/ShipCarrierHull.png');
    }
    if (!scene.textures.exists('ship-carrier-h')) {
        scene.load.image('ship-carrier-h', 'assets/ships/Carrier/ShipCarrierHull_Horizontal.png');
    }
    if (!scene.textures.exists('ship-cruiser')) {
        scene.load.image('ship-cruiser', 'assets/ships/Cruiser/ShipCruiserHull.png');
    }
    if (!scene.textures.exists('ship-cruiser-h')) {
        scene.load.image('ship-cruiser-h', 'assets/ships/Cruiser/ShipCruiserHull_Horizontal.png');
    }
    if (!scene.textures.exists('ship-nuclear-sub')) {
        scene.load.image('ship-nuclear-sub', 'assets/ships/Submarine/ShipNuclearSubHull.png');
    }
    if (!scene.textures.exists('ship-nuclear-sub-h')) {
        scene.load.image('ship-nuclear-sub-h', 'assets/ships/Submarine/ShipNuclearSubHull_Horizontal.png');
    }
    if (!scene.textures.exists('ship-attack-sub')) {
        scene.load.image('ship-attack-sub', 'assets/ships/Submarine/ShipAttackSubHull.png');
    }
    if (!scene.textures.exists('ship-attack-sub-h')) {
        scene.load.image('ship-attack-sub-h', 'assets/ships/Submarine/ShipAttackSubHull_Horizontal.png');
    }
    if (!scene.textures.exists('ship-submarine')) {
        scene.load.image('ship-submarine', 'assets/ships/Submarine/ShipSubMarineHull.png');
    }
    if (!scene.textures.exists('ship-destroyer')) {
        scene.load.image('ship-destroyer', 'assets/ships/Destroyer/ShipDestroyerHull.png');
    }
    if (!scene.textures.exists('ship-destroyer-h')) {
        scene.load.image('ship-destroyer-h', 'assets/ships/Destroyer/ShipDestroyerHull_Horizontal.png');
    }
}

function createHelpBackground(scene) {
    const { width, height } = scene.scale;
    scene.cameras.main.setBackgroundColor(0x09131f);

    const tile = scene.add.tileSprite(0, 0, width, height, 'help-wave-tile')
        .setOrigin(0, 0)
        .setDepth(-100);

    // Smaller tile scale makes the pattern feel farther away (matches GameScene).
    tile.setTileScale(0.5, 0.5);

    // Slight lift so copy stays readable without killing the ocean texture.
    scene.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.08)
        .setDepth(-99);

    return tile;
}

function createHelpTitle(scene, titleText) {
    const { width, height } = scene.scale;
    const panelWidth = Math.min(width * 0.82, 560);
    const panelHeight = Math.round(Math.max(52, Math.min(66, height * 0.09)));
    const fontSize = Math.round(Math.max(22, Math.min(34, panelHeight * 0.48)));

    const header = createRoundedMenuButton(scene, {
        x: width / 2,
        y: height * 0.115,
        width: panelWidth,
        height: panelHeight,
        label: titleText,
        fontFamily: HELP_FONT_FAMILY,
        fontSize,
        letterSpacing: 2,
        fill: HELP_CHROME_FILL,
        inset: HELP_CHROME_INSET,
        accent: HELP_CHROME_ACCENT,
        depth: 30,
        interactive: false,
        useHandCursor: false
    });

    header.text.setResolution(4);
    header.text.setShadow(0, 3, '#000000', 10, true, true);
    header.container.setAlpha(1);
    animateFlyInFromLeft(scene, header.container, 120);
    return header;
}

function createHelpBodyText(scene, x, y, wrapWidth, text) {
    const { height } = scene.scale;
    const fontSize = Math.round(Math.max(20, Math.min(30, height * 0.033)));
    const strokeThickness = Math.max(3, Math.round(fontSize * 0.16));

    const body = scene.add.text(x, y, text, {
        fontSize: `${fontSize}px`,
        fontFamily: HELP_FONT_FAMILY,
        fill: HELP_TEXT_FILL,
        stroke: HELP_TEXT_STROKE,
        strokeThickness,
        lineSpacing: Math.round(fontSize * 0.38),
        wordWrap: { width: wrapWidth, useAdvancedWrap: true }
    }).setOrigin(0, 0).setDepth(10);

    body.setResolution(4);
    body.setShadow(0, 2, '#000000', 8, true, true);
    return body;
}

function animateFlyInFromLeft(scene, targets, delay = 0) {
    const { width } = scene.scale;
    const list = Array.isArray(targets) ? targets : [targets];
    const original = list.map((target) => target.x);
    list.forEach((target, idx) => target.setX(original[idx] - width));

    scene.tweens.add({
        targets: list,
        x: (target, _key, _value, idx) => original[idx],
        delay,
        duration: 520,
        ease: 'Back.easeOut'
    });
}

function createArcadeButtonVisual(scene, x, y, r, baseColor, rimColor, iconType) {
    const container = scene.add.container(x, y).setDepth(20);

    const rim = scene.add.graphics();
    rim.fillStyle(rimColor, 0.55);
    rim.fillCircle(0, 0, r + 3);
    container.add(rim);

    const bg = scene.add.graphics();
    bg.fillStyle(baseColor, 1);
    bg.fillCircle(0, 0, r);
    container.add(bg);

    const highlight = scene.add.graphics();
    highlight.fillStyle(0xffffff, 0.18);
    highlight.fillEllipse(-r * 0.25, -r * 0.25, r * 1.1, r * 0.75);
    container.add(highlight);

    const icon = scene.add.graphics();
    icon.lineStyle(Math.max(2, Math.round(r * 0.12)), 0xffffff, 0.92);
    icon.fillStyle(0xffffff, 0.92);

    if (iconType === 'fire') {
        // Target reticle.
        icon.strokeCircle(0, 0, r * 0.38);
        icon.lineBetween(-r * 0.52, 0, -r * 0.18, 0);
        icon.lineBetween(r * 0.18, 0, r * 0.52, 0);
        icon.lineBetween(0, -r * 0.52, 0, -r * 0.18);
        icon.lineBetween(0, r * 0.18, 0, r * 0.52);
        icon.fillCircle(0, 0, Math.max(2, r * 0.06));
    } else if (iconType === 'sonar') {
        // Sonar waves.
        icon.strokeCircle(0, 0, r * 0.18);
        icon.strokeCircle(0, 0, r * 0.36);
        icon.strokeCircle(0, 0, r * 0.54);
        icon.lineBetween(-r * 0.52, 0, r * 0.52, 0);
    } else if (iconType === 'nuke') {
        // Simplified radiation symbol.
        icon.strokeCircle(0, 0, r * 0.56);
        icon.fillCircle(0, 0, r * 0.10);
        const wedgeR = r * 0.44;
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
            const a1 = angle - 0.45;
            const a2 = angle + 0.45;
            icon.beginPath();
            icon.moveTo(0, 0);
            icon.arc(0, 0, wedgeR, a1, a2, false);
            icon.closePath();
            icon.fillPath();
        }
        icon.fillStyle(baseColor, 1);
        icon.fillCircle(0, 0, r * 0.25);
    }

    container.add(icon);
    return container;
}

function createHelpContentPanel(scene, x, y, width, height) {
    const panel = scene.add.graphics().setDepth(8);
    panel.setPosition(x, y);

    const radius = 22;
    panel.fillStyle(0x07121c, 0.52);
    panel.fillRoundedRect(0, 0, width, height, radius);
    panel.lineStyle(2, HELP_CHROME_ACCENT, 0.55);
    panel.strokeRoundedRect(0, 0, width, height, radius);

    panel.lineStyle(2, HELP_CHROME_INSET, 0.9);
    panel.strokeRoundedRect(6, 6, width - 12, height - 12, radius - 6);

    // Corner bolts - subtle arcade cabinet touch.
    panel.fillStyle(0x04070a, 0.32);
    const boltR = 4;
    const boltInset = 16;
    panel.fillCircle(boltInset, boltInset, boltR);
    panel.fillCircle(width - boltInset, boltInset, boltR);
    panel.fillCircle(boltInset, height - boltInset, boltR);
    panel.fillCircle(width - boltInset, height - boltInset, boltR);

    return panel;
}

function sharpenHelpText(text, resolution = 4) {
    if (!text) return text;
    text.setResolution(resolution);
    return text;
}

function isPhonePortrait(scene) {
    const { width, height } = scene.scale;
    return width <= 520 && height > width;
}

function fitImageToBox(image, boxWidth, boxHeight, rotated = false) {
    const sourceWidth = rotated ? image.height : image.width;
    const sourceHeight = rotated ? image.width : image.height;
    const scale = Math.min(boxWidth / sourceWidth, boxHeight / sourceHeight);
    image.setScale(scale);
}

function getHelpShipPreviewKey(baseKey, orientation = 'horizontal') {
    return orientation === 'horizontal' ? `${baseKey}-h` : baseKey;
}

function shrinkTextToFit(text, maxBottomY, minFontSize = 18) {
    if (!text) return;
    const getSize = () => {
        const size = Number.parseInt(String(text.style.fontSize).replace('px', ''), 10);
        return Number.isFinite(size) ? size : 22;
    };

    let fontSize = getSize();
    let attempts = 0;
    while (attempts < 10 && fontSize > minFontSize && (text.y + text.height) > maxBottomY) {
        fontSize -= 2;
        text.setFontSize(fontSize);
        text.setStroke(text.style.stroke, Math.max(3, Math.round(fontSize * 0.16)));
        text.setLineSpacing(Math.round(fontSize * 0.34));
        attempts += 1;
    }
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export class HelpScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HelpScene' });
        this.returnScene = 'TitleScene';
        this.backgroundTile = null;
    }

    init(data) {
        this.returnScene = data?.from || 'TitleScene';
    }

    preload() {
        ensureHelpAssets(this);
    }

    create() {
        const { width, height } = this.scale;
        this.backgroundTile = createHelpBackground(this);

        createHelpTitle(this, 'HELP');

        const isLandscape = width > height;
        const buttonWidth = Math.min(width * 0.56, 320);
        const buttonHeight = Math.round(Math.max(40, Math.min(52, height * 0.065)));
        const startY = isLandscape ? height * 0.33 : height * 0.31;
        const spacing = Math.round(buttonHeight + Math.max(14, height * 0.02));

        const tip = this.add.text(width / 2, isLandscape ? height * 0.235 : height * 0.24, 'SELECT A TOPIC', {
            fontSize: `${Math.round(Math.max(16, Math.min(22, height * 0.03)))}px`,
            fontFamily: HELP_FONT_FAMILY,
            fill: HELP_TEXT_FILL,
            stroke: HELP_TEXT_STROKE,
            strokeThickness: 3,
            letterSpacing: 2
        }).setOrigin(0.5).setDepth(10);
        sharpenHelpText(tip);
        tip.setShadow(0, 2, '#000000', 7, true, true);
        animateFlyInFromLeft(this, tip, 170);

        const buttonSpecs = [
            { label: 'OBJECTIVE', key: 'HelpObjectiveScene' },
            { label: 'YOUR FLEET', key: 'HelpFleetScene' },
            { label: 'GAMEPLAY', key: 'HelpGameplayScene' },
            { label: 'ACTION BUTTONS', key: 'HelpActionButtonsScene' },
            { label: 'CONTROLS', key: 'HelpControlsScene' }
        ];

        buttonSpecs.forEach((spec, index) => {
            const y = startY + index * spacing;
            const btn = createRoundedMenuButton(this, {
                x: width / 2,
                y,
                width: buttonWidth,
                height: buttonHeight,
                label: spec.label,
                fontSize: Math.round(Math.min(buttonHeight * 0.34, 16)),
                onClick: () => this.scene.start(spec.key, { from: this.returnScene })
            });

            btn.container.setAlpha(1);
            animateFlyInFromLeft(this, btn.container, 240 + index * 90);
        });

        const backBtn = createRoundedMenuButton(this, {
            x: width / 2,
            y: height - Math.max(40, Math.round(height * 0.06)),
            width: Math.min(width * 0.46, 240),
            height: buttonHeight,
            label: 'BACK',
            fontSize: Math.round(Math.min(buttonHeight * 0.34, 16)),
            onClick: () => this.scene.start(this.returnScene)
        });
        backBtn.container.setAlpha(1);
        animateFlyInFromLeft(this, backBtn.container, 240 + buttonSpecs.length * 90);

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start(this.returnScene);
        });
    }

    handleResize() {
        this.scene.restart({ from: this.returnScene });
    }
}

class HelpBaseSectionScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.returnScene = 'TitleScene';
        this.backgroundTile = null;
    }

    init(data) {
        this.returnScene = data?.from || 'TitleScene';
    }

    preload() {
        ensureHelpAssets(this);
    }

    createSectionLayout(sectionTitle, bodyText, extrasFn) {
        const { width, height } = this.scale;

        this.backgroundTile = createHelpBackground(this);
        createHelpTitle(this, sectionTitle);

        const panelWidth = Math.min(width * 0.92, 980);
        const panelX = Math.round((width - panelWidth) / 2);
        const panelY = Math.round(height * 0.20);

        const buttonHeight = Math.round(Math.max(44, Math.min(60, height * 0.075)));
        const bottomMargin = Math.round(Math.max(22, height * 0.03));
        const panelBottom = Math.round(height - buttonHeight - (height * 0.10) - bottomMargin);
        const panelHeight = Math.round(Math.max(240, panelBottom - panelY));

        const panel = createHelpContentPanel(this, panelX, panelY, panelWidth, panelHeight);
        animateFlyInFromLeft(this, panel, 160);

        const padding = Math.round(Math.max(22, Math.min(34, width * 0.03)));
        const contentX = panelX + padding;
        const contentY = panelY + padding;
        const contentWidth = panelWidth - padding * 2;

        const body = createHelpBodyText(this, contentX, contentY, contentWidth, bodyText);
        animateFlyInFromLeft(this, body, 200);

        if (extrasFn) {
            extrasFn({
                panelX,
                panelY,
                panelWidth,
                panelHeight,
                padding,
                contentX,
                contentY,
                contentWidth,
                body
            });
        }

        const backBtn = createRoundedMenuButton(this, {
            x: width / 2,
            y: height - Math.max(40, Math.round(height * 0.06)),
            width: Math.min(width * 0.46, 240),
            height: buttonHeight,
            label: 'BACK',
            fontSize: Math.round(Math.min(buttonHeight * 0.34, 16)),
            onClick: () => this.scene.start('HelpScene', { from: this.returnScene })
        });

        animateFlyInFromLeft(this, backBtn.container, 260);

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('HelpScene', { from: this.returnScene });
        });
    }

    handleResize() {
        this.scene.restart({ from: this.returnScene });
    }
}

export class HelpObjectiveScene extends HelpBaseSectionScene {
    constructor() {
        super({ key: 'HelpObjectiveScene' });
    }

    create() {
        this.createSectionLayout(
            'OBJECTIVE',
            [
                'Sink all 5 enemy ships before they sink yours.',
                '',
                '• Hit - you fire again.',
                '• Miss - the enemy takes their turn.',
                '• Sink ships - you can unlock stronger action buttons.',
                '• Sink the full fleet to win the battle.'
            ].join('\n')
        );
    }
}

export class HelpFleetScene extends HelpBaseSectionScene {
    constructor() {
        super({ key: 'HelpFleetScene' });
    }

    create() {
        this.createSectionLayout(
            'YOUR FLEET',
            [
                'You command 5 ships:',
                '',
                '• Carrier (5 cells)',
                '• Nuclear Sub (3 cells) - Sonar ability',
                '• Cruiser (3 cells) - Row Nuke ability',
                '• Attack Sub (2 cells)',
                '• Destroyer (2 cells)',
                '',
                'Ship status icons:',
                '• Safe icon means the ship is still operational.',
                '• Hit icon means the ship has taken damage.'
            ].join('\n'),
            ({ panelX, panelY, panelWidth, panelHeight, padding, contentX, contentWidth, body }) => {
                const { width, height } = this.scale;
                const phonePortrait = isPhonePortrait(this);
                const wideLandscape = !phonePortrait && width >= 1500;

                if (wideLandscape) {
                    body.setText('FLEET LINE-UP');
                    body.setFontSize(22);
                    body.setLineSpacing(4);
                    sharpenHelpText(body);

                    const panelBottom = panelY + panelHeight - padding;
                    const previewWidth = Math.round(Math.min(280, panelWidth * 0.22));
                    const previewHeight = Math.round(Math.min(280, panelHeight - (padding * 2) - 36));
                    const previewX = Math.round(panelX + panelWidth - padding - previewWidth);
                    const previewY = Math.round(panelY + padding + 22);

                    const leftWidth = previewX - contentX - 24;
                    const titleY = Math.round(body.y + body.height + 6);

                    const sectionLead = this.add.text(contentX, titleY, 'Five ships. Five roles.', {
                        fontSize: '18px',
                        fontFamily: HELP_FONT_FAMILY,
                        fill: HELP_TEXT_FILL,
                        stroke: HELP_TEXT_STROKE,
                        strokeThickness: 3
                    }).setOrigin(0, 0).setDepth(10);
                    sharpenHelpText(sectionLead);
                    sectionLead.setShadow(0, 2, '#000000', 8, true, true);

                    const lineup = [
                        { key: getHelpShipPreviewKey('ship-carrier'), label: 'CARRIER', cells: 5, note: '' },
                        { key: getHelpShipPreviewKey('ship-nuclear-sub'), label: 'NUCLEAR SUB', cells: 3, note: 'SONAR ABILITY' },
                        { key: getHelpShipPreviewKey('ship-cruiser'), label: 'CRUISER', cells: 3, note: 'ROW NUKE ABILITY' },
                        { key: getHelpShipPreviewKey('ship-attack-sub'), label: 'ATTACK SUB', cells: 2, note: '' },
                        { key: getHelpShipPreviewKey('ship-destroyer'), label: 'DESTROYER', cells: 2, note: '' }
                    ];

                    const gridGapX = 16;
                    const gridGapY = 14;
                    const columns = 3;
                    const cardWidth = Math.floor((leftWidth - (gridGapX * 2)) / columns);
                    const statusRowY = panelBottom - 44;
                    const cardsTop = Math.round(sectionLead.y + sectionLead.height + 10);
                    const cardsBottom = statusRowY - 16;
                    const cardHeight = Math.max(82, Math.floor((cardsBottom - cardsTop - gridGapY) / 2));
                    const lineupObjects = [sectionLead];

                    for (let i = 0; i < lineup.length; i++) {
                        const item = lineup[i];
                        const row = i < 3 ? 0 : 1;
                        const col = i < 3 ? i : i - 3;
                        const secondRowCount = 2;
                        const secondRowWidth = (secondRowCount * cardWidth) + ((secondRowCount - 1) * gridGapX);
                        const secondRowStartX = Math.round(contentX + (leftWidth - secondRowWidth) / 2);
                        const cardX = row === 0
                            ? Math.round(contentX + col * (cardWidth + gridGapX))
                            : Math.round(secondRowStartX + col * (cardWidth + gridGapX));
                        const cardY = Math.round(cardsTop + row * (cardHeight + gridGapY));

                        const card = this.add.graphics().setDepth(9);
                        card.fillStyle(0x04090e, 0.26);
                        card.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 18);
                        card.lineStyle(2, HELP_CHROME_ACCENT, 0.35);
                        card.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 18);
                        lineupObjects.push(card);

                        const sprite = this.add.image(cardX + cardWidth / 2, cardY + 24, item.key)
                            .setOrigin(0.5)
                            .setDepth(10);
                        fitImageToBox(sprite, cardWidth * 0.7, 18);
                        lineupObjects.push(sprite);

                        const label = this.add.text(cardX + cardWidth / 2, cardY + 42, item.label, {
                            fontSize: '14px',
                            fontFamily: HELP_FONT_FAMILY,
                            fill: HELP_TEXT_FILL,
                            stroke: HELP_TEXT_STROKE,
                            strokeThickness: 2,
                            letterSpacing: 1
                        }).setOrigin(0.5, 0).setDepth(10);
                        sharpenHelpText(label);
                        label.setShadow(0, 2, '#000000', 7, true, true);
                        lineupObjects.push(label);

                        const meta = item.note
                            ? `${item.cells} CELLS - ${item.note}`
                            : `${item.cells} CELLS`;
                        const cells = this.add.text(cardX + cardWidth / 2, cardY + 62, meta, {
                            fontSize: '10px',
                            fontFamily: HELP_FONT_FAMILY,
                            fill: HELP_TEXT_FILL,
                            stroke: HELP_TEXT_STROKE,
                            strokeThickness: 2,
                            letterSpacing: 0
                        }).setOrigin(0.5, 0).setDepth(10);
                        sharpenHelpText(cells);
                        cells.setShadow(0, 2, '#000000', 7, true, true);
                        lineupObjects.push(cells);
                    }

                    const statusTitle = this.add.text(contentX, statusRowY - 30, 'SHIP STATUS', {
                        fontSize: '16px',
                        fontFamily: HELP_FONT_FAMILY,
                        fill: HELP_TEXT_FILL,
                        stroke: HELP_TEXT_STROKE,
                        strokeThickness: 3
                    }).setOrigin(0, 0.5).setDepth(10);
                    sharpenHelpText(statusTitle);
                    statusTitle.setShadow(0, 2, '#000000', 8, true, true);

                    const statusCardWidth = 320;
                    const statusCardHeight = 72;
                    const statusCardGap = 14;
                    const safeCardX = contentX + 20;
                    const safeCardY = statusRowY - 18;
                    const hitCardX = safeCardX;
                    const hitCardY = safeCardY + statusCardHeight + statusCardGap;

                    const safeCard = this.add.graphics().setDepth(9);
                    safeCard.fillStyle(0x04090e, 0.22);
                    safeCard.fillRoundedRect(safeCardX, safeCardY, statusCardWidth, statusCardHeight, 16);
                    safeCard.lineStyle(2, HELP_CHROME_ACCENT, 0.28);
                    safeCard.strokeRoundedRect(safeCardX, safeCardY, statusCardWidth, statusCardHeight, 16);

                    const hitCard = this.add.graphics().setDepth(9);
                    hitCard.fillStyle(0x04090e, 0.22);
                    hitCard.fillRoundedRect(hitCardX, hitCardY, statusCardWidth, statusCardHeight, 16);
                    hitCard.lineStyle(2, HELP_CHROME_ACCENT, 0.28);
                    hitCard.strokeRoundedRect(hitCardX, hitCardY, statusCardWidth, statusCardHeight, 16);

                    const safeIconY = safeCardY + statusCardHeight / 2;
                    const hitIconY = hitCardY + statusCardHeight / 2;
                    const safe = this.add.image(safeCardX + 18, safeIconY, 'ship-icon-safe').setOrigin(0, 0.5).setDepth(10);
                    const hit = this.add.image(hitCardX + 18, hitIconY, 'ship-icon-hit').setOrigin(0, 0.5).setDepth(10);
                    const largeIconSize = 56;
                    safe.setDisplaySize(largeIconSize, largeIconSize);
                    hit.setDisplaySize(largeIconSize, largeIconSize);

                    const safeLabel = this.add.text(safeCardX + 92, safeIconY - 10, 'SAFE', {
                        fontSize: '16px',
                        fontFamily: HELP_FONT_FAMILY,
                        fill: HELP_TEXT_FILL,
                        stroke: HELP_TEXT_STROKE,
                        strokeThickness: 3
                    }).setOrigin(0, 0.5).setDepth(10);
                    const hitLabel = this.add.text(hitCardX + 92, hitIconY - 10, 'HIT', {
                        fontSize: '16px',
                        fontFamily: HELP_FONT_FAMILY,
                        fill: HELP_TEXT_FILL,
                        stroke: HELP_TEXT_STROKE,
                        strokeThickness: 3
                    }).setOrigin(0, 0.5).setDepth(10);
                    const safeDesc = this.add.text(safeCardX + 92, safeIconY + 10, 'Ship still operational', {
                        fontSize: '12px',
                        fontFamily: HELP_FONT_FAMILY,
                        fill: HELP_TEXT_FILL,
                        stroke: HELP_TEXT_STROKE,
                        strokeThickness: 2
                    }).setOrigin(0, 0.5).setDepth(10);
                    const hitDesc = this.add.text(hitCardX + 92, hitIconY + 10, 'Ship has taken damage', {
                        fontSize: '12px',
                        fontFamily: HELP_FONT_FAMILY,
                        fill: HELP_TEXT_FILL,
                        stroke: HELP_TEXT_STROKE,
                        strokeThickness: 2
                    }).setOrigin(0, 0.5).setDepth(10);
                    sharpenHelpText(safeLabel);
                    sharpenHelpText(hitLabel);
                    sharpenHelpText(safeDesc);
                    sharpenHelpText(hitDesc);
                    safeLabel.setShadow(0, 2, '#000000', 7, true, true);
                    hitLabel.setShadow(0, 2, '#000000', 7, true, true);
                    safeDesc.setShadow(0, 2, '#000000', 6, true, true);
                    hitDesc.setShadow(0, 2, '#000000', 6, true, true);

                    const frame = this.add.graphics().setDepth(9);
                    frame.fillStyle(0x04090e, 0.34);
                    frame.fillRoundedRect(previewX - 12, previewY - 14, previewWidth + 24, previewHeight + 28, 16);
                    frame.lineStyle(2, 0xcdd4da, 0.65);
                    frame.strokeRoundedRect(previewX - 12, previewY - 14, previewWidth + 24, previewHeight + 28, 16);

                    const grid = this.add.graphics().setDepth(10);
                    grid.fillStyle(0x0b3d2d, 0.18);
                    grid.fillRect(previewX, previewY, previewWidth, previewHeight);
                    const previewCell = Math.min(previewWidth, previewHeight) / 10;
                    grid.lineStyle(1, 0xe8edf2, 0.25);
                    for (let i = 0; i <= 10; i++) {
                        const gx = Math.round(previewX + i * previewCell);
                        const gy = Math.round(previewY + i * previewCell);
                        grid.lineBetween(gx, previewY, gx, previewY + (previewCell * 10));
                        grid.lineBetween(previewX, gy, previewX + (previewCell * 10), gy);
                    }

                    const previewShips = [
                        { key: getHelpShipPreviewKey('ship-carrier'), gx: 1, gy: 1, len: 5, horizontal: true },
                        { key: getHelpShipPreviewKey('ship-nuclear-sub', 'vertical'), gx: 7, gy: 2, len: 3, horizontal: false },
                        { key: getHelpShipPreviewKey('ship-cruiser'), gx: 2, gy: 6, len: 3, horizontal: true },
                        { key: getHelpShipPreviewKey('ship-attack-sub', 'vertical'), gx: 8, gy: 7, len: 2, horizontal: false },
                        { key: getHelpShipPreviewKey('ship-destroyer'), gx: 5, gy: 8, len: 2, horizontal: true }
                    ];

                    const previewObjects = [frame, grid];
                    previewShips.forEach((item) => {
                        const sprite = this.add.image(
                            previewX + ((item.gx + (item.horizontal ? item.len / 2 : 0.5)) * previewCell),
                            previewY + ((item.gy + (item.horizontal ? 0.5 : item.len / 2)) * previewCell),
                            item.key
                        ).setOrigin(0.5).setDepth(11);

                        if (item.horizontal) {
                            sprite.setDisplaySize(item.len * previewCell * 0.9, previewCell * 0.72);
                        } else {
                            sprite.setDisplaySize(previewCell * 0.72, item.len * previewCell * 0.9);
                        }
                        previewObjects.push(sprite);
                    });

                    const previewLabel = this.add.text(previewX + previewWidth / 2, previewY - 16, 'PLACEMENT EXAMPLE', {
                        fontSize: '16px',
                        fontFamily: HELP_FONT_FAMILY,
                        fill: HELP_TEXT_FILL,
                        stroke: HELP_TEXT_STROKE,
                        strokeThickness: 3
                    }).setOrigin(0.5).setDepth(12);
                    sharpenHelpText(previewLabel);
                    previewLabel.setShadow(0, 2, '#000000', 7, true, true);
                    previewObjects.push(previewLabel);

                    animateFlyInFromLeft(
                        this,
                        [...lineupObjects, statusTitle, safeCard, hitCard, safe, hit, safeLabel, hitLabel, safeDesc, hitDesc, ...previewObjects].filter(Boolean),
                        240
                    );
                    return;
                }

                if (phonePortrait) {
                    body.setText('FLEET LINE-UP');
                    body.setFontSize(18);
                    body.setLineSpacing(4);
                    sharpenHelpText(body);

                    const viewportY = Math.round(body.y + body.height + 12);
                    const viewportHeight = Math.round(panelY + panelHeight - padding - viewportY - 8);
                    const viewportWidth = contentWidth;

                    const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
                    maskGraphics.fillStyle(0xffffff, 1);
                    maskGraphics.fillRect(contentX, viewportY, viewportWidth, viewportHeight);
                    const contentMask = maskGraphics.createGeometryMask();

                    const scrollContainer = this.add.container(0, 0).setDepth(9);
                    scrollContainer.setMask(contentMask);

                    const lineup = [
                        { key: getHelpShipPreviewKey('ship-carrier'), label: 'CARRIER', cells: 5, note: '' },
                        { key: getHelpShipPreviewKey('ship-nuclear-sub'), label: 'NUCLEAR SUB', cells: 3, note: 'SONAR ABILITY' },
                        { key: getHelpShipPreviewKey('ship-cruiser'), label: 'CRUISER', cells: 3, note: 'ROW NUKE ABILITY' },
                        { key: getHelpShipPreviewKey('ship-attack-sub'), label: 'ATTACK SUB', cells: 2, note: '' },
                        { key: getHelpShipPreviewKey('ship-destroyer'), label: 'DESTROYER', cells: 2, note: '' }
                    ];

                    const scrollObjects = [];
                    let cursorY = viewportY;

                    const lead = this.add.text(contentX, cursorY, 'Scroll to view the full fleet guide.', {
                        fontSize: '16px',
                        fontFamily: HELP_FONT_FAMILY,
                        fill: HELP_TEXT_FILL,
                        stroke: HELP_TEXT_STROKE,
                        strokeThickness: 3
                    }).setOrigin(0, 0).setDepth(10);
                    sharpenHelpText(lead);
                    lead.setShadow(0, 2, '#000000', 7, true, true);
                    scrollObjects.push(lead);
                    cursorY += Math.round(lead.height + 14);

                    const cardWidth = viewportWidth - 8;
                    const cardHeight = 116;

                    lineup.forEach((item) => {
                        const cardX = contentX;
                        const cardY = cursorY;

                        const card = this.add.graphics().setDepth(9);
                        card.fillStyle(0x04090e, 0.28);
                        card.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 18);
                        card.lineStyle(2, HELP_CHROME_ACCENT, 0.35);
                        card.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 18);
                        scrollObjects.push(card);

                        const sprite = this.add.image(cardX + cardWidth / 2, cardY + 28, item.key)
                            .setOrigin(0.5)
                            .setDepth(10);
                        fitImageToBox(sprite, cardWidth * 0.74, 24);
                        scrollObjects.push(sprite);

                        const label = this.add.text(cardX + cardWidth / 2, cardY + 50, item.label, {
                            fontSize: '18px',
                            fontFamily: HELP_FONT_FAMILY,
                            fill: HELP_TEXT_FILL,
                            stroke: HELP_TEXT_STROKE,
                            strokeThickness: 3,
                            letterSpacing: 1
                        }).setOrigin(0.5, 0).setDepth(10);
                        sharpenHelpText(label);
                        label.setShadow(0, 2, '#000000', 7, true, true);
                        scrollObjects.push(label);

                        const meta = item.note
                            ? `${item.cells} CELLS - ${item.note}`
                            : `${item.cells} CELLS`;
                        const cells = this.add.text(cardX + cardWidth / 2, cardY + 82, meta, {
                            fontSize: '14px',
                            fontFamily: HELP_FONT_FAMILY,
                            fill: HELP_TEXT_FILL,
                            stroke: HELP_TEXT_STROKE,
                            strokeThickness: 3,
                            letterSpacing: 0
                        }).setOrigin(0.5, 0).setDepth(10);
                        sharpenHelpText(cells);
                        cells.setShadow(0, 2, '#000000', 7, true, true);
                        scrollObjects.push(cells);

                        cursorY += cardHeight + 14;
                    });

                    const statusTitle = this.add.text(contentX, cursorY + 4, 'SHIP STATUS', {
                        fontSize: '18px',
                        fontFamily: HELP_FONT_FAMILY,
                        fill: HELP_TEXT_FILL,
                        stroke: HELP_TEXT_STROKE,
                        strokeThickness: 3
                    }).setOrigin(0, 0).setDepth(10);
                    sharpenHelpText(statusTitle);
                    statusTitle.setShadow(0, 2, '#000000', 7, true, true);
                    scrollObjects.push(statusTitle);
                    cursorY += statusTitle.height + 14;

                    const statusRows = [
                        { key: 'ship-icon-safe', title: 'SAFE', desc: 'Ship still operational' },
                        { key: 'ship-icon-hit', title: 'HIT', desc: 'Ship has taken damage' }
                    ];

                    statusRows.forEach((item) => {
                        const rowCard = this.add.graphics().setDepth(9);
                        rowCard.fillStyle(0x04090e, 0.22);
                        rowCard.fillRoundedRect(contentX, cursorY, cardWidth, 76, 16);
                        rowCard.lineStyle(2, HELP_CHROME_ACCENT, 0.28);
                        rowCard.strokeRoundedRect(contentX, cursorY, cardWidth, 76, 16);
                        scrollObjects.push(rowCard);

                        const icon = this.add.image(contentX + 16, cursorY + 38, item.key).setOrigin(0, 0.5).setDepth(10);
                        icon.setDisplaySize(56, 56);
                        scrollObjects.push(icon);

                        const label = this.add.text(contentX + 88, cursorY + 24, item.title, {
                            fontSize: '17px',
                            fontFamily: HELP_FONT_FAMILY,
                            fill: HELP_TEXT_FILL,
                            stroke: HELP_TEXT_STROKE,
                            strokeThickness: 3
                        }).setOrigin(0, 0.5).setDepth(10);
                        const desc = this.add.text(contentX + 88, cursorY + 50, item.desc, {
                            fontSize: '13px',
                            fontFamily: HELP_FONT_FAMILY,
                            fill: HELP_TEXT_FILL,
                            stroke: HELP_TEXT_STROKE,
                            strokeThickness: 2
                        }).setOrigin(0, 0.5).setDepth(10);
                        sharpenHelpText(label);
                        sharpenHelpText(desc);
                        label.setShadow(0, 2, '#000000', 7, true, true);
                        desc.setShadow(0, 2, '#000000', 6, true, true);
                        scrollObjects.push(label, desc);

                        cursorY += 90;
                    });

                    const previewTitle = this.add.text(contentX, cursorY + 4, 'PLACEMENT EXAMPLE', {
                        fontSize: '18px',
                        fontFamily: HELP_FONT_FAMILY,
                        fill: HELP_TEXT_FILL,
                        stroke: HELP_TEXT_STROKE,
                        strokeThickness: 3
                    }).setOrigin(0, 0).setDepth(10);
                    sharpenHelpText(previewTitle);
                    previewTitle.setShadow(0, 2, '#000000', 7, true, true);
                    scrollObjects.push(previewTitle);
                    cursorY += previewTitle.height + 14;

                    const previewSize = Math.round(Math.min(cardWidth - 8, 260));
                    const previewX = Math.round(contentX + (viewportWidth - previewSize) / 2);
                    const previewY = cursorY;
                    const previewCell = previewSize / 10;

                    const frame = this.add.graphics().setDepth(9);
                    frame.fillStyle(0x04090e, 0.34);
                    frame.fillRoundedRect(previewX - 12, previewY - 14, previewSize + 24, previewSize + 28, 16);
                    frame.lineStyle(2, 0xcdd4da, 0.65);
                    frame.strokeRoundedRect(previewX - 12, previewY - 14, previewSize + 24, previewSize + 28, 16);
                    scrollObjects.push(frame);

                    const grid = this.add.graphics().setDepth(10);
                    grid.fillStyle(0x0b3d2d, 0.18);
                    grid.fillRect(previewX, previewY, previewSize, previewSize);
                    grid.lineStyle(1, 0xe8edf2, 0.25);
                    for (let i = 0; i <= 10; i++) {
                        const p = Math.round(previewX + i * previewCell);
                        const q = Math.round(previewY + i * previewCell);
                        grid.lineBetween(p, previewY, p, previewY + previewSize);
                        grid.lineBetween(previewX, q, previewX + previewSize, q);
                    }
                    scrollObjects.push(grid);

                    const previewShips = [
                        { key: getHelpShipPreviewKey('ship-carrier'), gx: 1, gy: 1, len: 5, horizontal: true },
                        { key: getHelpShipPreviewKey('ship-nuclear-sub', 'vertical'), gx: 7, gy: 2, len: 3, horizontal: false },
                        { key: getHelpShipPreviewKey('ship-cruiser'), gx: 2, gy: 6, len: 3, horizontal: true },
                        { key: getHelpShipPreviewKey('ship-attack-sub', 'vertical'), gx: 8, gy: 7, len: 2, horizontal: false },
                        { key: getHelpShipPreviewKey('ship-destroyer'), gx: 5, gy: 8, len: 2, horizontal: true }
                    ];
                    previewShips.forEach((item) => {
                        const sprite = this.add.image(
                            previewX + ((item.gx + (item.horizontal ? item.len / 2 : 0.5)) * previewCell),
                            previewY + ((item.gy + (item.horizontal ? 0.5 : item.len / 2)) * previewCell),
                            item.key
                        ).setOrigin(0.5).setDepth(11);
                        if (item.horizontal) {
                            sprite.setDisplaySize(item.len * previewCell * 0.9, previewCell * 0.72);
                        } else {
                            sprite.setDisplaySize(previewCell * 0.72, item.len * previewCell * 0.9);
                        }
                        scrollObjects.push(sprite);
                    });

                    cursorY += previewSize + 26;
                    const totalContentHeight = cursorY - viewportY;
                    const maxScroll = Math.max(0, totalContentHeight - viewportHeight);
                    let scrollOffset = 0;
                    let dragStartY = 0;
                    let dragStartOffset = 0;

                    scrollObjects.forEach((obj) => {
                        scrollContainer.add(obj);
                    });
                    animateFlyInFromLeft(this, scrollContainer, 240);

                    const applyScroll = (nextOffset) => {
                        scrollOffset = clamp(nextOffset, 0, maxScroll);
                        scrollContainer.setY(-scrollOffset);
                    };

                    const scrollZone = this.add.zone(contentX, viewportY, viewportWidth, viewportHeight)
                        .setOrigin(0, 0)
                        .setDepth(40)
                        .setInteractive({ useHandCursor: false, draggable: true });

                    scrollZone.on('wheel', (_pointer, _dx, dy) => {
                        applyScroll(scrollOffset + (dy * 0.8));
                    });

                    scrollZone.on('pointerdown', (pointer) => {
                        dragStartY = pointer.y;
                        dragStartOffset = scrollOffset;
                    });

                    scrollZone.on('pointermove', (pointer) => {
                        if (!pointer.isDown) return;
                        applyScroll(dragStartOffset - (pointer.y - dragStartY));
                    });

                    this.input.on('pointerup', () => {
                        dragStartOffset = scrollOffset;
                    });
                    return;
                }

                // --- Ship line-up (each ship shown under its description) ---
                const lineupTop = body.y + body.height + Math.round(Math.max(18, height * 0.02));
                const lineupBottomLimit = panelY + panelHeight - padding - 190;
                const showLineup = lineupTop < lineupBottomLimit;

                /** @type {{key: string, label: string, cells: number}[]} */
                const lineup = [
                    { key: getHelpShipPreviewKey('ship-carrier'), label: 'CARRIER', cells: 5 },
                    { key: getHelpShipPreviewKey('ship-nuclear-sub'), label: 'NUCLEAR SUB', cells: 3 },
                    { key: getHelpShipPreviewKey('ship-cruiser'), label: 'CRUISER', cells: 3 },
                    { key: getHelpShipPreviewKey('ship-attack-sub'), label: 'ATTACK SUB', cells: 2 },
                    { key: getHelpShipPreviewKey('ship-destroyer'), label: 'DESTROYER', cells: 2 }
                ];

                const lineupObjects = [];
                let lineupEndY = lineupTop;

                if (showLineup) {
                    const gridGap = Math.round(Math.max(10, Math.min(18, width * 0.025)));
                    const columns = phonePortrait ? 2 : 5;
                    const rows = Math.ceil(lineup.length / columns);
                    const cardWidth = Math.floor((contentWidth - gridGap * (columns - 1)) / columns);
                    const cardHeight = Math.round(Math.max(78, Math.min(108, height * 0.13)));

                    const maxLineupHeight = Math.min(panelY + panelHeight - padding - 160 - lineupTop, rows * cardHeight + (rows - 1) * gridGap);
                    const clampedRows = Math.max(1, Math.floor((maxLineupHeight + gridGap) / (cardHeight + gridGap)));
                    const visibleCount = Math.min(lineup.length, clampedRows * columns);

                    for (let i = 0; i < visibleCount; i++) {
                        const item = lineup[i];
                        const col = i % columns;
                        const row = Math.floor(i / columns);
                        const cardX = Math.round(contentX + col * (cardWidth + gridGap));
                        const cardY = Math.round(lineupTop + row * (cardHeight + gridGap));
                        lineupEndY = Math.max(lineupEndY, cardY + cardHeight);

                        const card = this.add.graphics().setDepth(9);
                        card.fillStyle(0x04090e, 0.28);
                        card.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 16);
                        card.lineStyle(2, HELP_CHROME_ACCENT, 0.35);
                        card.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 16);
                        lineupObjects.push(card);

                        const sprite = this.add.image(cardX + cardWidth / 2, cardY + cardHeight * 0.42, item.key)
                            .setOrigin(0.5)
                            .setDepth(10);
                        fitImageToBox(sprite, cardWidth * 0.82, cardHeight * 0.22);

                        const tag = this.add.text(cardX + cardWidth / 2, cardY + cardHeight * 0.74, item.label, {
                            fontSize: `${phonePortrait ? 13 : 14}px`,
                            fontFamily: HELP_FONT_FAMILY,
                            fill: HELP_TEXT_FILL,
                            stroke: HELP_TEXT_STROKE,
                            strokeThickness: 3,
                            letterSpacing: 1
                        }).setOrigin(0.5).setDepth(10);
                        sharpenHelpText(tag);
                        tag.setShadow(0, 2, '#000000', 7, true, true);

                        const cells = this.add.text(cardX + cardWidth / 2, cardY + cardHeight * 0.90, `${item.cells} CELLS`, {
                            fontSize: `${phonePortrait ? 12 : 13}px`,
                            fontFamily: HELP_FONT_FAMILY,
                            fill: HELP_TEXT_FILL,
                            stroke: HELP_TEXT_STROKE,
                            strokeThickness: 3,
                            letterSpacing: 1
                        }).setOrigin(0.5).setDepth(10);
                        sharpenHelpText(cells);
                        cells.setShadow(0, 2, '#000000', 7, true, true);

                        lineupObjects.push(sprite, tag, cells);
                    }
                }

                // --- Status icons (safe / hit) ---
                const afterLineupY = showLineup ? lineupEndY : (body.y + body.height);
                const statusTop = Math.round(Math.min(panelY + panelHeight - padding - 170, Math.max(lineupTop + 10, afterLineupY + 22)));

                const iconBox = Math.round(Math.min(56, Math.max(40, height * 0.06)));
                const iconSize = Math.round(iconBox * 0.92);

                let safe;
                let hit;
                let safeLabel;
                let hitLabel;

                if (phonePortrait) {
                    const colGap = Math.round(Math.max(18, width * 0.06));
                    const leftX = Math.round(panelX + panelWidth / 2 - colGap / 2 - iconBox);
                    const rightX = Math.round(panelX + panelWidth / 2 + colGap / 2);

                    safe = this.add.image(leftX + iconBox / 2, statusTop, 'ship-icon-safe').setOrigin(0.5).setDepth(10);
                    hit = this.add.image(rightX + iconBox / 2, statusTop, 'ship-icon-hit').setOrigin(0.5).setDepth(10);
                    safe.setDisplaySize(iconSize, iconSize);
                    hit.setDisplaySize(iconSize, iconSize);

                    const labelStyle = {
                        fontSize: '16px',
                        fontFamily: HELP_FONT_FAMILY,
                        fill: HELP_TEXT_FILL,
                        stroke: HELP_TEXT_STROKE,
                        strokeThickness: 3,
                        letterSpacing: 1
                    };

                    safeLabel = this.add.text(safe.x, safe.y + iconBox * 0.62, 'SAFE', labelStyle).setOrigin(0.5).setDepth(10);
                    hitLabel = this.add.text(hit.x, hit.y + iconBox * 0.62, 'HIT', labelStyle).setOrigin(0.5).setDepth(10);
                    sharpenHelpText(safeLabel);
                    sharpenHelpText(hitLabel);
                    safeLabel.setShadow(0, 2, '#000000', 7, true, true);
                    hitLabel.setShadow(0, 2, '#000000', 7, true, true);
                } else {
                    const iconY = statusTop;
                    safe = this.add.image(contentX + 22, iconY, 'ship-icon-safe').setOrigin(0, 0.5).setDepth(10);
                    hit = this.add.image(contentX + 22, iconY + 44, 'ship-icon-hit').setOrigin(0, 0.5).setDepth(10);

                    const r = Math.round(Math.min(30, Math.max(20, height * 0.03)));
                    const largeIconSize = Math.round(r * 2.15);
                    safe.setDisplaySize(largeIconSize, largeIconSize);
                    hit.setDisplaySize(largeIconSize, largeIconSize);
                    hit.setY(iconY + largeIconSize + 14);

                    const labelStyle = {
                        fontSize: '18px',
                        fontFamily: HELP_FONT_FAMILY,
                        fill: HELP_TEXT_FILL,
                        stroke: HELP_TEXT_STROKE,
                        strokeThickness: 3
                    };
                    safeLabel = this.add.text(contentX + 92, iconY, 'SAFE', labelStyle).setOrigin(0, 0.5).setDepth(10);
                    hitLabel = this.add.text(contentX + 92, hit.y, 'HIT', labelStyle).setOrigin(0, 0.5).setDepth(10);
                    sharpenHelpText(safeLabel);
                    sharpenHelpText(hitLabel);
                    safeLabel.setShadow(0, 2, '#000000', 7, true, true);
                    hitLabel.setShadow(0, 2, '#000000', 7, true, true);
                }

                const animated = [
                    ...lineupObjects,
                    safe,
                    hit,
                    safeLabel,
                    hitLabel
                ].filter(Boolean);
                animateFlyInFromLeft(this, animated, 240);

                // --- Placement preview (keep on-screen in phone portrait) ---
                const previewMax = Math.round(Math.min(240, Math.max(160, panelWidth * 0.44)));
                const previewSize = phonePortrait ? Math.round(Math.min(previewMax, contentWidth)) : Math.round(Math.min(220, Math.max(160, width * 0.18)));

                const previewX = phonePortrait
                    ? Math.round(panelX + (panelWidth - previewSize) / 2)
                    : Math.round(panelX + panelWidth - padding - previewSize);

                const previewTopCandidate = phonePortrait
                    ? Math.round(Math.max(statusTop + 90, body.y + body.height + 60))
                    : Math.round(statusTop);

                const previewY = Math.round(Math.min(panelY + panelHeight - padding - previewSize - 10, previewTopCandidate));

                if (previewY + previewSize <= panelY + panelHeight - padding) {
                    const cell = previewSize / 10;

                    const frame = this.add.graphics().setDepth(9);
                    frame.fillStyle(0x04090e, 0.34);
                    frame.fillRoundedRect(previewX - 12, previewY - 14, previewSize + 24, previewSize + 28, 16);
                    frame.lineStyle(2, 0xcdd4da, 0.65);
                    frame.strokeRoundedRect(previewX - 12, previewY - 14, previewSize + 24, previewSize + 28, 16);

                    const grid = this.add.graphics().setDepth(10);
                    grid.fillStyle(0x0b3d2d, 0.18);
                    grid.fillRect(previewX, previewY, previewSize, previewSize);
                    grid.lineStyle(1, 0xe8edf2, 0.25);
                    for (let i = 0; i <= 10; i++) {
                        const p = Math.round(previewX + i * cell);
                        const q = Math.round(previewY + i * cell);
                        grid.lineBetween(p, previewY, p, previewY + previewSize);
                        grid.lineBetween(previewX, q, previewX + previewSize, q);
                    }

                    const ship = this.add.graphics().setDepth(11);
                    ship.fillStyle(0x1e252b, 0.78);
                    ship.lineStyle(2, 0xf5f7fa, 0.6);
                    const placeShip = (gx, gy, len, horizontal) => {
                        const x = previewX + gx * cell;
                        const y = previewY + gy * cell;
                        const w = horizontal ? len * cell : cell;
                        const h = horizontal ? cell : len * cell;
                        ship.fillRoundedRect(x + 2, y + 2, w - 4, h - 4, 6);
                        ship.strokeRoundedRect(x + 2, y + 2, w - 4, h - 4, 6);
                    };

                    // Example fleet (not tied to game state): carrier, cruiser, destroyer, 2 subs.
                    placeShip(1, 1, 5, true);
                    placeShip(6, 3, 3, false);
                    placeShip(2, 6, 3, true);
                    placeShip(8, 7, 2, false);
                    placeShip(4, 8, 2, true);

                    const previewLabel = this.add.text(previewX + previewSize / 2, previewY - 18, 'PLACEMENT EXAMPLE', {
                        fontSize: '16px',
                        fontFamily: HELP_FONT_FAMILY,
                        fill: HELP_TEXT_FILL,
                        stroke: HELP_TEXT_STROKE,
                        strokeThickness: 3
                    }).setOrigin(0.5).setDepth(12);
                    sharpenHelpText(previewLabel);
                    previewLabel.setShadow(0, 2, '#000000', 7, true, true);

                    animateFlyInFromLeft(this, [frame, grid, ship, previewLabel], 320);
                }
            }
        );
    }
}

export class HelpGameplayScene extends HelpBaseSectionScene {
    constructor() {
        super({ key: 'HelpGameplayScene' });
    }

    create() {
        this.createSectionLayout(
            'GAMEPLAY',
            [
                'Target the enemy board to attack.',
                '',
                '• Select a cell to aim.',
                '• Press FIRE to confirm the shot.',
                '• HIT gives you a bonus turn.',
                '• MISS switches turn to the enemy.',
                '• Sink ships to increase your score and unlock action buttons.'
            ].join('\n')
        );
    }
}

export class HelpActionButtonsScene extends HelpBaseSectionScene {
    constructor() {
        super({ key: 'HelpActionButtonsScene' });
    }

    create() {
        this.createSectionLayout(
            'ACTION BUTTONS',
            [
                'Arcade buttons give you special actions:',
                '',
                '• FIRE (Red) confirms your selected attack.',
                '• SONAR (Blue) reveals a nearby zone (limited use).',
                '• NUKE (Orange) attacks an entire row (earned by sinking ships).'
            ].join('\n'),
            ({ panelX, panelY, panelWidth, panelHeight, padding, body }) => {
                const { width, height } = this.scale;
                const phonePortrait = isPhonePortrait(this);

                if (phonePortrait) {
                    body.setText([
                        'ARCADE BUTTONS',
                        '',
                        '- FIRE confirms your shot.',
                        '- SONAR scans nearby cells.',
                        '- NUKE hits one full row.'
                    ].join('\n'));
                    body.setFontSize(width <= 375 ? 16 : 17);
                    body.setLineSpacing(4);
                    sharpenHelpText(body);
                }

                const maxIconWidth = Math.min(panelWidth - padding * 2, width * 0.92);
                const r = Math.round(phonePortrait ? Math.min(26, Math.max(20, height * 0.025)) : Math.min(34, Math.max(22, height * 0.032)));

                const labelStyle = {
                    fontSize: phonePortrait ? '13px' : '16px',
                    fontFamily: HELP_FONT_FAMILY,
                    fill: HELP_TEXT_FILL,
                    stroke: HELP_TEXT_STROKE,
                    strokeThickness: 3,
                    letterSpacing: 1
                };

                const panelBottom = panelY + panelHeight - padding;
                const labelHalfHeight = phonePortrait ? 10 : 10;
                const maxIconCenterY = Math.round(panelBottom - (r + 16 + labelHalfHeight));

                let fire;
                let sonar;
                let nuke;
                let fireLabel;
                let sonarLabel;
                let nukeLabel;

                if (phonePortrait || maxIconWidth < (r * 2 * 3 + r * 3)) {
                    // 2-up grid to avoid overflow in phone portrait.
                    const colGap = Math.round(Math.max(18, width * 0.06));
                    const rowGap = Math.round(Math.max(40, height * 0.05));
                    const cx = Math.round(panelX + panelWidth / 2);
                    const xLeft = Math.round(cx - colGap / 2 - r * 2);
                    const xRight = Math.round(cx + colGap / 2 + r * 2);

                    const yBottom = maxIconCenterY;
                    const yTop = Math.round(yBottom - rowGap);

                    // Ensure body text never collides with the icon block.
                    const maxBodyBottom = Math.round((yTop - r) - 18);
                    shrinkTextToFit(body, maxBodyBottom, 15);

                    fire = createArcadeButtonVisual(this, xLeft, yTop, r, 0xb81d1d, 0xff8b8b, 'fire');
                    sonar = createArcadeButtonVisual(this, xRight, yTop, r, 0x1b5bd6, 0x9cc4ff, 'sonar');
                    nuke = createArcadeButtonVisual(this, cx, yBottom, r, 0xc56a15, 0xffd1a1, 'nuke');

                    fireLabel = this.add.text(fire.x, fire.y + r + 16, 'FIRE', labelStyle).setOrigin(0.5).setDepth(21);
                    sonarLabel = this.add.text(sonar.x, sonar.y + r + 16, 'SONAR', labelStyle).setOrigin(0.5).setDepth(21);
                    nukeLabel = this.add.text(nuke.x, nuke.y + r + 16, 'NUKE', labelStyle).setOrigin(0.5).setDepth(21);
                } else {
                    const spacing = Math.round(r * 2.8);
                    const centerX = width / 2;
                    const x0 = centerX - spacing;
                    const x1 = centerX;
                    const x2 = centerX + spacing;

                    const iconY = maxIconCenterY;

                    const maxBodyBottom = Math.round((iconY - r) - 22);
                    shrinkTextToFit(body, maxBodyBottom, 18);

                    fire = createArcadeButtonVisual(this, x0, iconY, r, 0xb81d1d, 0xff8b8b, 'fire');
                    sonar = createArcadeButtonVisual(this, x1, iconY, r, 0x1b5bd6, 0x9cc4ff, 'sonar');
                    nuke = createArcadeButtonVisual(this, x2, iconY, r, 0xc56a15, 0xffd1a1, 'nuke');

                    fireLabel = this.add.text(fire.x, iconY + r + 18, 'FIRE', labelStyle).setOrigin(0.5).setDepth(21);
                    sonarLabel = this.add.text(sonar.x, iconY + r + 18, 'SONAR', labelStyle).setOrigin(0.5).setDepth(21);
                    nukeLabel = this.add.text(nuke.x, iconY + r + 18, 'NUKE', labelStyle).setOrigin(0.5).setDepth(21);
                }

                [fireLabel, sonarLabel, nukeLabel].forEach((label) => {
                    if (!label) return;
                    sharpenHelpText(label);
                    label.setShadow(0, 2, '#000000', 7, true, true);
                });

                const iconLabelBottom = Math.max(
                    fireLabel ? fireLabel.getBottomCenter().y : 0,
                    sonarLabel ? sonarLabel.getBottomCenter().y : 0,
                    nukeLabel ? nukeLabel.getBottomCenter().y : 0
                );
                const tipY = Math.round(Math.min(panelY + panelHeight - 16, iconLabelBottom + 28));

                const tip = this.add.text(panelX + panelWidth / 2, tipY, 'TIP - READY BUTTONS PULSE', {
                    fontSize: phonePortrait ? '14px' : '15px',
                    fontFamily: HELP_FONT_FAMILY,
                    fill: HELP_TEXT_FILL,
                    stroke: HELP_TEXT_STROKE,
                    strokeThickness: 3,
                    letterSpacing: 2
                }).setOrigin(0.5, 0.5).setDepth(21);
                sharpenHelpText(tip);
                tip.setShadow(0, 2, '#000000', 7, true, true);

                animateFlyInFromLeft(this, [fire, sonar, nuke, fireLabel, sonarLabel, nukeLabel].filter(Boolean), 280);
                animateFlyInFromLeft(this, tip, 320);
            }
        );
    }
}

export class HelpControlsScene extends HelpBaseSectionScene {
    constructor() {
        super({ key: 'HelpControlsScene' });
    }

    create() {
        this.createSectionLayout(
            'CONTROLS',
            [
                'Mouse and touch:',
                '• Tap or click a cell to select a target.',
                '• Press FIRE to confirm the shot.',
                '',
                'Keyboard:',
                '• ESC returns to the previous menu.'
            ].join('\n')
        );
    }
}
