/**
 * @fileoverview Settings screen for Battleships and Subs.
 * Provides audio/visual controls with persistent storage.
 * @namespace SettingsScene
 */

import { GAME_CONSTANTS } from '../config/gameConfig.js';

/**
 * Settings scene class with audio and visual controls
 * @class
 * @augments Phaser.Scene
 */
export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
        this.settings = {
            masterVolume: 0.7,
            sfxVolume: 0.8,
            musicVolume: 0.6,
            visualEffects: true,
            animations: true
        };
        this.sliders = [];
        this.toggles = [];
    }

    preload() {
        // Load settings from localStorage if available
        this.loadSettings();
    }

    create() {
        const { width, height } = this.scale;
        
        // Create background
        this.createBackground();
        
        // Create title
        this.createTitle(width, height);
        
        // Create settings controls
        this.createAudioControls(width, height);
        this.createVisualControls(width, height);
        
        // Create back button
        this.createBackButton(width, height);
        
        // Setup input
        this.setupInput();
    }

    /**
     * Create gradient background matching title screen
     */
    createBackground() {
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1e3c72, 0x1e3c72, 0x2a5298, 0x2a5298, 1);
        graphics.fillRect(0, 0, this.scale.width, this.scale.height);
    }

    /**
     * Create settings title
     */
    createTitle(width, height) {
        this.add.text(width / 2, height * 0.12, 'SETTINGS', {
            fontSize: Math.min(width * 0.06, 42) + 'px',
            fontFamily: 'Arial Black',
            fill: '#ffffff',
            stroke: '#1e3c72',
            strokeThickness: 4
        }).setOrigin(0.5);
    }

    /**
     * Create audio control sliders
     */
    createAudioControls(width, height) {
        const startY = height * 0.25;
        const spacing = height * 0.12;
        const sliderWidth = Math.min(width * 0.5, 300);

        const audioControls = [
            { label: 'Master Volume', key: 'masterVolume', value: this.settings.masterVolume },
            { label: 'Sound Effects', key: 'sfxVolume', value: this.settings.sfxVolume },
            { label: 'Music', key: 'musicVolume', value: this.settings.musicVolume }
        ];

        audioControls.forEach((control, index) => {
            const y = startY + (index * spacing);
            
            // Label
            this.add.text(width / 2, y - 20, control.label, {
                fontSize: '18px',
                fontFamily: 'Arial',
                fill: '#ffffff',
                fontWeight: 'bold'
            }).setOrigin(0.5);

            // Slider track
            const track = this.add.rectangle(
                width / 2, y + 10, sliderWidth, 8, 0x2c3e50
            );

            // Slider fill (represents current value)
            const fill = this.add.rectangle(
                width / 2 - sliderWidth / 2, y + 10,
                sliderWidth * control.value, 8, 0x3498db
            ).setOrigin(0, 0.5);

            // Slider handle
            const handle = this.add.circle(
                width / 2 - sliderWidth / 2 + (sliderWidth * control.value),
                y + 10, 12, 0xffffff
            );
            handle.setStrokeStyle(2, 0x3498db);
            handle.setInteractive({ draggable: true, useHandCursor: true });

            // Value display
            const valueText = this.add.text(
                width / 2, y + 35,
                Math.round(control.value * 100) + '%',
                { fontSize: '14px', fill: '#a0c4ff' }
            ).setOrigin(0.5);

            // Handle dragging
            handle.on('drag', (pointer) => {
                const minX = width / 2 - sliderWidth / 2;
                const maxX = width / 2 + sliderWidth / 2;
                const newX = Phaser.Math.Clamp(pointer.x, minX, maxX);
                
                handle.x = newX;
                
                const value = (newX - minX) / sliderWidth;
                this.settings[control.key] = value;
                
                fill.width = sliderWidth * value;
                valueText.setText(Math.round(value * 100) + '%');
                
                this.saveSettings();
            });

            // Store references
            this.sliders.push({ track, fill, handle, valueText, key: control.key });
        });
    }

    /**
     * Create visual toggle controls
     */
    createVisualControls(width, height) {
        const startY = height * 0.65;
        const spacing = height * 0.08;

        const visualControls = [
            { label: 'Visual Effects', key: 'visualEffects', value: this.settings.visualEffects },
            { label: 'Animations', key: 'animations', value: this.settings.animations }
        ];

        visualControls.forEach((control, index) => {
            const y = startY + (index * spacing);
            
            // Label
            this.add.text(width / 2 - 80, y, control.label, {
                fontSize: '18px',
                fontFamily: 'Arial',
                fill: '#ffffff',
                fontWeight: 'bold'
            }).setOrigin(0, 0.5);

            // Toggle switch background
            const toggleBg = this.add.rectangle(
                width / 2 + 80, y, 60, 30, 
                control.value ? 0x2ecc71 : 0x95a5a6
            ).setStrokeStyle(2, 0xffffff);
            toggleBg.setInteractive({ useHandCursor: true });

            // Toggle switch handle
            const toggleHandle = this.add.circle(
                width / 2 + 80 + (control.value ? 15 : -15), y,
                12, 0xffffff
            );

            // Toggle interaction
            toggleBg.on('pointerdown', () => {
                this.settings[control.key] = !this.settings[control.key];
                const newValue = this.settings[control.key];
                
                toggleBg.setFillStyle(newValue ? 0x2ecc71 : 0x95a5a6);
                
                this.tweens.add({
                    targets: toggleHandle,
                    x: width / 2 + 80 + (newValue ? 15 : -15),
                    duration: 200,
                    ease: 'Back.easeOut'
                });
                
                this.saveSettings();
            });

            this.toggles.push({ toggleBg, toggleHandle, key: control.key });
        });
    }

    /**
     * Create back button
     */
    createBackButton(width, height) {
        const buttonY = height * 0.88;
        const buttonWidth = Math.min(width * 0.4, 200);
        const buttonHeight = 50;

        const button = this.add.rectangle(
            width / 2, buttonY, buttonWidth, buttonHeight, 0x2c3e50
        );
        button.setStrokeStyle(3, 0xe74c3c);
        button.setInteractive({ useHandCursor: true });

        const text = this.add.text(width / 2, buttonY, 'BACK', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            button.setFillStyle(0xe74c3c);
            this.tweens.add({
                targets: [button, text],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150
            });
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x2c3e50);
            this.tweens.add({
                targets: [button, text],
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
        });

        button.on('pointerdown', () => {
            this.scene.start('TitleScene');
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupInput() {
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('TitleScene');
        });
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('battleshipsSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('battleshipsSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    /**
     * Handle dynamic resize - reposition elements without restart
     */
    handleResize(width, height) {
        // Update title position
        const titleText = this.children.list.find(child => child.type === 'Text' && child.text === 'SETTINGS');
        if (titleText) {
            titleText.setPosition(width / 2, height * 0.12);
            titleText.setFontSize(Math.min(width * 0.06, 42) + 'px');
        }

        // Update audio controls positions
        const startY = height * 0.25;
        const spacing = height * 0.12;
        const sliderWidth = Math.min(width * 0.5, 300);

        this.sliders.forEach((slider, index) => {
            const y = startY + (index * spacing);

            // Update label
            const labels = this.children.list.filter(child => child.type === 'Text');
            const label = labels[index * 2 + 1]; // Skip title
            if (label) {
                label.setPosition(width / 2, y - 20);
            }

            // Update slider components
            slider.track.setPosition(width / 2, y + 10);
            slider.track.width = sliderWidth;

            slider.fill.setPosition(width / 2 - sliderWidth / 2, y + 10);

            const value = this.settings[slider.key];
            slider.handle.setPosition(width / 2 - sliderWidth / 2 + (sliderWidth * value), y + 10);

            slider.valueText.setPosition(width / 2, y + 35);
        });

        // Update visual controls positions
        const visualStartY = height * 0.65;
        const visualSpacing = height * 0.08;

        this.toggles.forEach((toggle, index) => {
            const y = visualStartY + (index * visualSpacing);

            const labels = this.children.list.filter(child => child.type === 'Text');
            const label = labels[6 + index]; // After audio labels
            if (label) {
                label.setPosition(width / 2 - 80, y);
            }

            toggle.toggleBg.setPosition(width / 2 + 80, y);
            const isOn = this.settings[toggle.key];
            toggle.toggleHandle.setPosition(width / 2 + 80 + (isOn ? 15 : -15), y);
        });

        // Update back button
        const backButton = this.children.list.find(child => child.type === 'Rectangle' && child.fillColor === 0x2c3e50);
        const backText = this.children.list.find(child => child.type === 'Text' && child.text === 'BACK');
        if (backButton && backText) {
            const buttonY = height * 0.88;
            const buttonWidth = Math.min(width * 0.4, 200);
            backButton.setPosition(width / 2, buttonY);
            backButton.setSize(buttonWidth, 50);
            backText.setPosition(width / 2, buttonY);
        }
    }
}