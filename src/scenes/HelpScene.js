/**
 * @fileoverview HelpScene - Brief core game rules display
 * @namespace HelpScene
 */

import { GAME_CONSTANTS } from '../config/gameConfig.js';

/**
 * Help scene displaying brief core game rules
 * @class
 * @augments Phaser.Scene
 */
export class HelpScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HelpScene' });
        this.returnScene = 'TitleScene'; // Default return destination
    }

    init(data) {
        // Remember which scene to return to
        this.returnScene = data?.from || 'TitleScene';
    }

    create() {
        const { width, height } = this.scale;
        const C = GAME_CONSTANTS.COLORS;

        // Background
        this.cameras.main.setBackgroundColor(C.BACKGROUND);

        // Title
        this.add.text(width / 2, 40, 'GAME RULES', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Rules text
        const rules = [
            'OBJECTIVE',
            'Sink all 5 enemy ships before they sink yours',
            '',
            'YOUR FLEET',
            '• Carrier (5 cells)',
            '• Nuclear Sub (3 cells) - Sonar Ping ability',
            '• Cruiser (3 cells) - Row Nuke ability',
            '• Attack Sub (2 cells)',
            '• Destroyer (2 cells)',
            '',
            'GAMEPLAY',
            '• Click enemy grid to attack',
            '• HIT = bonus turn, keep attacking',
            '• MISS = turn switches to enemy',
            '• Sink 3 ships = unlock Row Nuke',
            '',
            'ARCADE BUTTONS',
            '• RED (FIRE) - Confirm attack on selected cell',
            '• BLUE (SONAR) - Reveal 3x3 zone (one use)',
            '• ORANGE (NUKE) - Attack entire row (sink 3 ships to earn)',
            '• Chain bonus - Multiple hits in a row = score multiplier',
            '',
            'CONTROLS',
            '• Click/Tap enemy grid cells to target',
            '• Tap a cell then press FIRE to attack',
            '• SONAR and NUKE activate special attack modes'
        ];

        const startY = 90;
        const lineHeight = Math.min(22, height * 0.028);
        const fontSize = Math.min(14, height * 0.018);

        rules.forEach((line, index) => {
            const isHeader = line === line.toUpperCase() && line.length > 3 && !line.startsWith('•');
            const style = {
                fontSize: isHeader ? (fontSize + 2) + 'px' : fontSize + 'px',
                fontFamily: isHeader ? 'Arial Black' : 'Arial',
                fill: isHeader ? '#ffff00' : '#ffffff',
                fontWeight: isHeader ? 'bold' : 'normal'
            };

            this.add.text(width / 2, startY + (index * lineHeight), line, style).setOrigin(0.5);
        });

        // Back button
        const backBtn = this.add.rectangle(width / 2, height - 40, 120, 40, 0x2c3e50)
            .setStrokeStyle(2, 0xe74c3c)
            .setInteractive({ useHandCursor: true });
        const backText = this.add.text(width / 2, height - 40, 'BACK', {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            fill: '#ffffff'
        }).setOrigin(0.5);

        backBtn.on('pointerover', () => backBtn.setFillStyle(0xe74c3c));
        backBtn.on('pointerout',  () => backBtn.setFillStyle(0x2c3e50));
        backBtn.on('pointerdown', () => this.scene.start(this.returnScene));

        // ESC key to return
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start(this.returnScene);
        });
    }
}
