import Phaser from 'phaser'
import Phaser from 'phaser'
import AnimationKeys from '~/consts/AnimationKeys'
import TextureKeys from '~/consts/TextureKeys'
import LaserObstacle from '~/game/LaserObstacle'
import RocketMouse from '~/game/RocketMouse'

export default class Game extends Phaser.Scene
{

    private background!: Phaser.GameObjects.TileSprite

    private mouseHole!: Phaser.GameObjects.Image

    private window1!: Phaser.GameObjects.Image
    private window2!: Phaser.GameObjects.Image

    private bookcase1!: Phaser.GameObjects.Image
    private bookcase2!: Phaser.GameObjects.Image

    private bookcases: Phaser.GameObjects.Image[] = []
    private windows: Phaser.GameObjects.Image[] = []

    private laserObstacle!: LaserObstacle
    private mouse!: RocketMouse
    private coins!: Phaser.Physics.Arcade.StaticGroup

    private scoreLabel!: Phaser.GameObjects.Text
    private score = 0

    constructor()
    {
        super('game')
    }

    init() 
    {
        this.score = 0
    }

    preload() {}

    create() 
    {
        const width = this.scale.width
        const height = this.scale.height

        this.background = this.add.tileSprite(
            0, 0, 
            width, height, 
            TextureKeys.Background
        )
        .setOrigin(0)
        .setScrollFactor(0, 0)

        this.mouseHole = this.add.image(
            Phaser.Math.Between(900, 1500),
            501,
            TextureKeys.MouseHole
        )

        this.window1 = this.add.image(
            Phaser.Math.Between(900, 1300),
            200, 
            TextureKeys.Window1
        )
        
        this.window2 = this.add.image(
            Phaser.Math.Between(1600, 2000),
            200, 
            TextureKeys.Window2
        )

        this.windows = [this.window1, this.window2]

        this.bookcase1 = this.add.image(
            Phaser.Math.Between(2200, 2700),
            580, 
            TextureKeys.Bookcase1
        ).setOrigin(0.5, 1)

        this.bookcase2 = this.add.image(
            Phaser.Math.Between(2900, 3400),
            580, 
            TextureKeys.Bookcase2
        ).setOrigin(0.5, 1)

        this.bookcases = [this.bookcase1, this.bookcase2]

        this.laserObstacle = new LaserObstacle(this, 900, 100)
        this.add.existing(this.laserObstacle)

        this.mouse = new RocketMouse(this, width * 0.5, height - 30)
        const mouse = this.mouse
        this.add.existing(mouse)

        const body = mouse.body as Phaser.Physics.Arcade.Body
        body.setCollideWorldBounds(true)
        body.setVelocityX(200)

        this.cameras.main.startFollow(mouse)
        this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height)

        this.physics.world.setBounds(
            0, 0,
            Number.MAX_SAFE_INTEGER, height - 30
        )

        this.physics.add.overlap(
            this.laserObstacle, 
            mouse,
            this.handleOverlapLaser, 
            undefined,
            this
        )

        this.physics.add.overlap(
            this.coins,
            mouse,
            this.handleCollectCoin,
            undefined,
            this
        )

        this.coins = this.physics.add.staticGroup()
        this.spwanCoins()

        this.scoreLabel = this.add.text(10, 10, `Socre: ${this.score}`, {
            fontSize: '24px',
            color: '#080808',
            backgroundColor: '#F8E71C',
            shadow: {
                fill: true,
                blur: 0,
                offsetY: 0
            },
            padding: {
                left: 15, 
                right: 15, 
                top: 10,
                bottom: 10
            }
        })
        .setScrollFactor(0)
    }

    handleCollectCoin(
        obj1: Phaser.GameObjects.GameObject,
        obj2: Phaser.GameObjects.GameObject) 
    {
        const coin = obj2 as Phaser.Physics.Arcade.Sprite
        this.coins.killAndHide(coin)
        coin.body.enable = false

        this.score += 1
        this.scoreLabel.text = `Score: ${this.score}`
    }

    private spwanCoins() 
    {
        this.coins.children.each(child => {
            const coin = child as Phaser.Physics.Arcade.Sprite
            this.coins.killAndHide(coin)
            coin.body.enable = false
        })

        const scrollX = this.cameras.main.scrollX
        const rightEdge = scrollX + this.scale.width

        let x = rightEdge + 100

        const numCoins = Phaser.Math.Between(1, 20)

        for (let i = 0; i < numCoins; ++i)
        {
            const coin = this.coins.get(
                x,
                Phaser.Math.Between(100, this.scale.height - 100),
                TextureKeys.Coin
            ) as Phaser.Physics.Arcade.Sprite

            coin.setVisible(true)
            coin.setActive(true)

            const body = coin.body as Phaser.Physics.Arcade.StaticBody
            body.setCircle(body.width * 0.5)
            body.enable = true

            x += coin.width * 1.5
        }
    }

    private handleOverlapLaser(
        obj1: Phaser.GameObjects.GameObject,
        obj2: Phaser.GameObjects.GameObject
    )
    {
        console.log('overlap')
        this.mouse.kill()
    }

    private wrapLaserObtacle()
    {
        const scrollX = this.cameras.main.scrollX
        const rightEdge = scrollX + this.scale.width

        const width = this.laserObstacle.width

        const body = this.laserObstacle.body as Phaser.Physics.Arcade.StaticBody
        if (this.laserObstacle.x + width < scrollX)
        {
            this.laserObstacle.x = Phaser.Math.Between(
                rightEdge + width,
                rightEdge + width + 1000
            )

            this.laserObstacle.y = Phaser.Math.Between(0, 300)

            body.position.x = this.laserObstacle.x + body.offset.x
            body.position.y = this.laserObstacle.y
        }
    }

    private wrapMouseHole() 
    {
        const scrollX = this.cameras.main.scrollX
        const rightEdge = scrollX + this.scale.width

        if (this.mouseHole.x + this.mouseHole.width < scrollX)
        {
            this.mouseHole.x = Phaser.Math.Between(
                rightEdge + 100,
                rightEdge + 1000
            )
        }
    }

    private wrapWindows() 
    {
        const scrollX = this.cameras.main.scrollX
        const rightEdge = scrollX + this.scale.width

        let width = this.window1.width * 2
        if (this.window1.x + width < scrollX)
        {
            this.window1.x = Phaser.Math.Between(
                rightEdge + width,
                rightEdge + width + 800
            )

            const overlap = this.bookcases.find(bc => {
                return Math.abs(this.window1.x - bc.x) <= this.window1.width
            })
            this.window1.visible = !overlap
        }

        width = this.window2.width
        if (this.window2.x + width < scrollX)
        {
            this.window2.x = Phaser.Math.Between(
                this.window1.x + width,
                this.window1.x + width + 800
            )

            const overlap = this.bookcases.find(bc => {
                return Math.abs(this.window2.x - bc.x) <= this.window2.width
            })
            this.window2.visible = !overlap
        }
    }

    private wrapBookcase()
    {
        const scrollX = this.cameras.main.scrollX
        const rightEdge = scrollX + this.scale.width

        let width = this.bookcase1.width * 2
        if (this.bookcase1.x + width < scrollX)
        {
            this.bookcase1.x = Phaser.Math.Between(
                rightEdge + width,
                rightEdge + width + 800
            )
        }

        width = this.bookcase2.width
        if (this.bookcase2.x + width < scrollX)
        {
            this.bookcase2.x = Phaser.Math.Between(
                this.bookcase1.x + width,
                this.bookcase1.x + width + 800
            )
        }

    }


    update(t: number, dt: number)
    {
        this.wrapMouseHole()
        this.wrapWindows()
        this.wrapBookcase()
        this.wrapLaserObtacle()
        this.background.setTilePosition(this.cameras.main.scrollX)
    }
}