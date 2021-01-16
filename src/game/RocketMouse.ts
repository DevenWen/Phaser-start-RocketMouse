import Phaser from 'phaser'
import AnimationKeys from '~/consts/AnimationKeys'
import SceneKeys from '~/consts/SceneKeys'
import TextureKeys from '~/consts/TextureKeys'

enum MouseState {
    Running,
    Killed,
    Dead
}

export default class RocketMouse extends Phaser.GameObjects.Container
{

    private mouseState = MouseState.Running

    private flames: Phaser.GameObjects.Sprite
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys
    private mouse: Phaser.GameObjects.Sprite

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y)

        this.mouse = scene.add.sprite(0, 0, TextureKeys.RocketMouse)
            .setOrigin(0.5, 1)
            .play(AnimationKeys.RocketMouseRun)

        this.flames = scene.add.sprite(-63, -15, TextureKeys.RocketMouse)
            .play(AnimationKeys.RocketFlamesOn)

        this.createAnimations()

        this.add(this.flames)
        this.add(this.mouse)

        this.mouse.play(AnimationKeys.RocketMouseRun)
        this.flames.play(AnimationKeys.RocketFlamesOn)

        scene.physics.add.existing(this)

        const body = this.body as Phaser.Physics.Arcade.Body
        body.setSize(this.mouse.width * 0.5, this.mouse.height * 0.7)
        body.setOffset(this.mouse.width * -0.3, -this.mouse.height + 15)

        this.enableJetpack(false)

        this.cursors = scene.input.keyboard.createCursorKeys()
    }

    enableJetpack(enable: boolean)
    {
        this.flames.setVisible(enable)
        if (enable) {
            this.mouse.play(AnimationKeys.RocketMouseFall, true)
        }
    }


    kill()
    {

        if (this.mouseState !== MouseState.Running) {
            return
        }

        this.mouseState = MouseState.Killed

        this.mouse.play(AnimationKeys.RocketMouseDead)

        const body = this.body as Phaser.Physics.Arcade.Body
        body.setAccelerationY(0)
        body.setVelocity(1000, 0)
        this.enableJetpack(false)
    }

    preUpdate()
    {
        switch (this.mouseState)
        {
            case MouseState.Running: 
            {
                this.preUpdateRunning()
                break
            }

            case MouseState.Killed:
            {
                this.preUpdateKill()
                break
            }

            case MouseState.Dead:
            {
                this.preUpdateDead()
                break
            }
        }

    }
    
    preUpdateDead()
    {
        const body = this.body as Phaser.Physics.Arcade.Body
        body.setVelocity(0, 0)

        this.scene.scene.run(SceneKeys.GameOver)
    }

    preUpdateKill()
    {
        const body = this.body as Phaser.Physics.Arcade.Body
        body.velocity.x *= 0.982
        if (body.velocity.x <= 5)
        {
            this.mouseState = MouseState.Dead
        }
    }

    preUpdateRunning()
    {
        const body = this.body as Phaser.Physics.Arcade.Body

        if (this.cursors.space?.isDown)
        {
            console.info("space up....")
            body.setAccelerationY(-1200)
            this.enableJetpack(true)
        }
        else
        {
            body.setAccelerationY(600)
            this.enableJetpack(false)
        }

        if (body.blocked.down)
        {
            this.mouse.play(AnimationKeys.RocketMouseRun, true)
        }
        else if (body.velocity.y > 0)
        {
            this.mouse.play(AnimationKeys.RocketMouseFall, true)
        }
    }

    private createAnimations()
    {
        this.mouse.anims.create({
            key: AnimationKeys.RocketMouseRun,
            frames: this.mouse.anims.generateFrameNames(TextureKeys.RocketMouse, {
                start: 1, 
                end: 4, 
                prefix: 'rocketmouse_run',
                zeroPad: 2,
                suffix: '.png'
            }),
            frameRate: 10,
            repeat: -1
        })

        this.flames.anims.create({
            key: AnimationKeys.RocketFlamesOn,
            frames:this.flames.anims.generateFrameNames(TextureKeys.RocketMouse,
                {
                    start:1, 
                    end: 2,
                    prefix: 'flame',
                    suffix: '.png'
                }),
            frameRate: 10,
            repeat: -1
        })

        this.mouse.anims.create({
            key: AnimationKeys.RocketMouseFall,
            frames: [{
                key: TextureKeys.RocketMouse,
                frame: 'rocketmouse_fall01.png'
            }]
        })

        this.mouse.anims.create({
            key: AnimationKeys.RocketMouseDead,
            frames: this.mouse.anims.generateFrameNames(TextureKeys.RocketMouse, 
                {
                    start: 1,
                    end: 2, 
                    prefix: 'rocketmouse_dead',
                    zeroPad: 2, 
                    suffix: '.png'
                }),
                frameRate: 10
        })
    }

}