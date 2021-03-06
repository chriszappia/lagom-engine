import {SpriteSheet} from "lagom-engine";

import muteSpr from './Art/mute.png';
import {Entity} from "lagom-engine";
import {AnimatedSpriteController} from "lagom-engine";
import {LD47} from "./LD47";
import {Timer} from "lagom-engine";
import {Component} from "lagom-engine";
import {System} from "lagom-engine";
import {Button} from "lagom-engine";

const Mouse = require('pixi.js-mouse');

const muteSheet = new SpriteSheet(muteSpr, 22, 22);

// TODO probably should make a generic version of this for future use
class MuteComp extends Component
{
}

class MuteListener extends System
{
    types = () => [AnimatedSpriteController, MuteComp];

    update(delta: number): void
    {
        this.runOnEntities((e: Entity, spr: AnimatedSpriteController) => {
            if (Mouse.isButtonPressed(Button.LEFT))
            {
                const pos = e.scene.game.renderer.plugins.interaction.mouse.global;

                if (pos.x > 0 && pos.x < 22 && pos.y > 0 && pos.y < 22)
                {
                    (e.scene.getEntityWithName("audio") as SoundManager).toggleMute();
                    spr.setAnimation(Number(LD47.muted));
                }
            }
        });
    }
}

export class SoundManager extends Entity
{
    constructor()
    {
        super("audio", 0, 0);

        this.startMusic();
    }

    onAdded(): void
    {
        super.onAdded();

        this.addComponent(new MuteComp());
        const spr = this.addComponent(new AnimatedSpriteController(Number(LD47.muted), [
            {
                id: 0,
                textures: muteSheet.textures([[0, 0]])
            }, {
                id: 1,
                textures: muteSheet.textures([[1, 0]])
            }]));

        this.addComponent(new Timer(50, spr, false)).onTrigger.register((caller, data) => {
            data.setAnimation(Number(LD47.muted));
        });

        this.scene.addSystem(new MuteListener());
    }

    toggleMute()
    {
        LD47.muted = !LD47.muted;

        if (LD47.muted)
        {
            this.stopAllSounds();
        }
        else
        {
            this.startMusic();
        }
    }

    startMusic()
    {
        if (!LD47.muted && !LD47.musicPlaying)
        {
            LD47.audioAtlas.play("music");
            LD47.musicPlaying = true;
        }
    }

    stopAllSounds(music = true)
    {
        if (music)
        {
            LD47.audioAtlas.sounds.forEach((v, k) => v.stop());
            LD47.musicPlaying = false;
        }
        else
        {
            LD47.audioAtlas.sounds.forEach((v, k) => {
                if (k !== "music") v.stop();
            });
        }
    }

    onRemoved(): void
    {
        super.onRemoved();
        this.stopAllSounds(false);
    }

    playSound(name: string)
    {
        if (!LD47.muted)
        {
            LD47.audioAtlas.play(name);
        }
    }
}
