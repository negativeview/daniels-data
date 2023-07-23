# Custom Weapons

## Quickstart

First, find all of your weapons in your inventory and drag them to your hotbar at the bottom of your screen. This will give you the "default" macro for your weapons, provided by the core system. Depending on your preferences, you may want to just stop here. However, the default macro has a few things that I find annoying. Clicking it simply puts a message into the chat that you need to find and click to continue. If you hit, you have to come back to this message to roll damage, and manually choose whether it is a critical or not. That's lame.

## Upgrading to Daniel's Data Macros

Right click on your weapon's entry in the toolbar and click "Edit Macro." You should see a field called "Command" that has a single line of code in it. Delete that line, you won't need it.

Replace it with the name of your weapon, with parenthesis after it. Below is the list of the ones I have implemented thusfar (all the weapons my players have currently):

    dagger();
    dart();
    javelin();
    lightCrossbow();
    longbow();
    longsword();
    shortsword();
    spear();
    warhammer();

## Customizing

If you click the macros now it should (hopefully!) prompt you for any questions it may have, and then roll the dice without you having to interact with the chat at all. It also rolls your damage at the same time, and knows whether you got a critical, and will roll critical damage if so.

But what if those questions are annoying? The spear can be used one or two handed, for instance, and it will (by default) ask you which one you want to do every single time. Lame!

Every one of the above functions can take "arguments" that modify how they work. This is just JavaScript, so if you're having issues, grab someone who knows JavaScript or ping me.

    abilityScore: `string` Most weapons only use your strength. A few can use dexterity or strength. For those, it will by default use the higher number. If anyone gets the ability to use charisma to attack or something, this allows that.
    advantage: `boolean` Do you have advantage on this attack?
    crit: `number` Default: 20. If your d20 gets this number or above, consider it a critical hit.
    damage: `string` example: '1d8'
    disadvantage: `boolean` Do you have disadvantage on this attack?
    handedness: `string` 'one' or 'two' for how many hands you are using. Only used to determine damage on some weapons, ignored if you hard-code the damage.
    name: `string` Override the name of the weapon. Has no mechanical changes otherwise.
    proficiencies: `array`. This is pretty nerdy. What abilities do you need to be considered proficient in the weapon. You almost certainly won't need to change this.
