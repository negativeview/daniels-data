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


### abilityScore

Type: String

Most weapons use your strength. Ranged weapons like bows use your dexterity. A few weapons (those with the "finesse" trait) can use either strength or dexterity. By default these will use whatever score is higher, or strength if they are tied. This is almost certainly the correct thing for those simple weapons. I am confident enough it doesn't even prompt you.

However, there are a few ways in D&D to use weird scores for your attacks instead of strength or dexterity. You could use this for that.

Example:
    warhammer({ abilityScore: 'cha' });

### advantage

Type: Boolean

Do you have advantage on this attack? This will prevent it from prompting you. This could be used if you wanted to have separate buttons for advantage/disadvantage/normal. There is also a disadvantage flag, see further on for how the logic behind this works.

Example:
    warhammer({ advantage: true });

### crit

Type: Number

By default, you score a critical hit if the d20 shows a 20. There are ways to change this number, and get criticals on a 19 (and up), for example. Whatever this number is (default 20), it will consider anything meeting or exceeding this number as a critical when rolling for damage.

Example:
    warhammer({ crit: 19 });

### damage

Type: String

This is the roll for damage. All of the standard weapons have this number already defined for what should be right. Anything you put here will be doubled on a critical. See `handedness` for an interaction.

Example:
    warhammer({ damage: '1d8' });

### disadvantage

Type: Boolean

Whether this attack has disadvantage. See `advantage` for why you might want to use this.

### handedness

Type: String 'one' or 'two'

How many hands you are using for this weapon. This is ignored for most weapons, and only used for weapons that are tagged as "versatile." If you are using a versatile weapon and do not specify, it will ask. This is **only** used to decide on damage, so it is ignored if you specify damage.

### name

Type: String

What we call this weapon. Can be used to give your weapon a name, or declare that your warhammer is really a war shovel. Has no mechanical changes.

### proficiencies

Type: Array

This one is very technical. In general, I hope you will never need to change this.

## Advantage and Disadvantage

The rules for advantage and disadvantage in 5e is kindof complex. You can have any number of things giving you advantage, they do not stack, you simply "have advantage." You can also have any number of things giving you disadvantage, they also do not stack, you simply "have disadvantage." **Then** if you would have advantage **and** disadvantage, you instead have neither. So if you had three advantages, and only one disadvantage, you'd have ... neither.

The flags for the weapons rolls implement this logic. If neither field is set, it'll ask. If both are set, it'll be a flat roll. Eventually I want this to be smarter and automatically give you advantage or disadvantage in some situations that it can automatically detect. In that case, it would also be responsible for merging your stated status with the external situational ones.