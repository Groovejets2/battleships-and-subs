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
            'SPECIAL ABILITIES',
            '• SONAR - Reveal 3×3 zone (one use)',
            '• NUKE - Attack entire row (earn by sinking ships)',
            '• Chain bonus - Multiple hits in a row = score multiplier',
            '',
            'CONTROLS',
            '• Click/Tap cells to attack',
            '• Use FIRE button for touch-friendly targeting',
            '• SONAR and NUKE buttons for special attacks'
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
        backBtn.on('pointerdown', () => this.scene.start('GameScene'));

        // ESC key to return
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('GameScene');
        });
    }
}
