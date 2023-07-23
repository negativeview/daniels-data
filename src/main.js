console.log('Got here??');

Hooks.on('renderChatMessage', (chatMessage, els, rendered) => {
    if (!chatMessage.flags.isNewAttack) return;

    els[0].getElementsByClassName('message-content')[0].innerHTML = `
        <div style="display: flex; justify-content: space-around;">
            <div style="position: relative;" title="${
                chatMessage.rolls.find((roll) => roll.options.flavor == 'To Hit').result
            }">
                <div><i class="fas fa-shield" style="font-size: 300%;"></i></div>
                <div style="display: flex; width: 100%; align-items: center; position: absolute; top: 0; left: 0; bottom: 0;">
                    <div style="font-size: 150%; color: white; width: 100%; text-align: center;">
                        ${
                            chatMessage.rolls.find((roll) => roll.options.flavor == 'To Hit').total
                        }
                    </div>
                </div>
            </div>
            <div style="position: relative;" title="${
                chatMessage.rolls.find((roll) => roll.options.flavor == 'Damage').result
            }">
                <div><i class="fas fa-heart" style="font-size: 300%; ${
                    chatMessage.flags.isCritical ? 'color: red;' : ''
                }"></i></div>
                <div style="display: flex; width: 100%; align-items: center; position: absolute; top: 0; left: 0; bottom: 0;">
                    <div style="font-size: 150%; color: white; width: 100%; text-align: center;">
                        ${
                            chatMessage.rolls.find((roll) => roll.options.flavor == 'Damage').total
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
    console.log('message-content', chatMessage);
});

function chooseAbility(actorId) {
    const actor = game.actors.find((a) => a._id == actorId);
    const str = actor.system.abilities['str'].mod;
    const dex = actor.system.abilities['dex'].mod;

    if (dex > str) return 'dex';
    return 'str';
}

async function doAttackRoll(
    {
        name,
        actorId,
        abilityScore,
        isProficient,
        proficiencies,
        advantage,
        disadvantage,
        crit,
        damage
    } = {}
) {
    const actor = game.actors.find((a) => a._id == actorId);
    let modifier = actor.system.abilities[abilityScore].mod;
    let proficiencyBonus = actor.system.attributes.prof;

    if (!crit) crit = 20;

    if (isProficient == null) {
        isProficient = actor.system.traits.weaponProf.value.find(
            (p) => proficiencies.includes(p)
        ) !== null;
    }

    let attackRoll;
    if (advantage && !disadvantage) {
        attackRoll = '2d20kh';
    } else if (disadvantage && !advantage) {
        attackRoll = '2d20kl'
    } else {
        attackRoll = '1d20';
    }
    if (isProficient) {
        attackRoll += ' + @proficiencyBonus';
    }
    attackRoll += ' + @modifier';

    let roll = new Roll(
        attackRoll,
        { proficiencyBonus: proficiencyBonus, modifier: modifier },
        { flavor: 'To Hit' }
    );
    await roll.evaluate();

    let chatData = {
        flavor: `${name} - ${damage} - ${abilityScore}`,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        user: game.userId,
        flags: {
            isNewAttack: true,
            isCritical: roll.dice[0].total >= crit
        },
        speaker: {
            scene: game.users.current.viewedScene,
            actor: actor,
        }
    }

    let damageRoll;
    if (roll.dice[0].total >= crit) {
        damageRoll = '@damage + @damage + @modifier'
    } else {
        damageRoll = '@damage + @modifier'
    }

    let roll2 = new Roll(
        damageRoll,
        { damage: damage, modifier: modifier },
        { flavor: 'Damage' }
    )
    await roll2.evaluate();

    chatData.rolls = [roll, roll2];
    ChatMessage.applyRollMode(chatData, "roll");
    ChatMessage.create(chatData);
}

function chooseMode() {
    return new Promise((resolve, reject) => {
        let d = new Dialog({
            title: 'Advantage/Disadvantage',
            content: '',
            buttons: {
                dis: {
                    icon: '<i class="fas fa-poo"></i>',
                    label: 'Disadvantage',
                    callback: async() => {
                        resolve({ advantage: false, disadvantage: true });
                    }
                },
                normal: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Normal',
                    callback: async() => {
                        resolve({ advantage: false, disadvantage: false });
                    }
                },
                adv: {
                    icon: '<i class="fas fa-heart"></i>',
                    label: 'Advantage',
                    callback: async() => {
                        resolve({ advantage: true, disadvantage: false });
                    }
                }
            },
            default: 'normal'
        });
        d.render(true);
    });
}

async function chooseToken() {
    return new Promise((resolve, reject) => {
        if (canvas.tokens.ownedTokens.length == 1) {
            return resolve(canvas.tokens.ownedTokens[0]);
        }
        return reject(null);
    });
}

async function chooseHandedness() {
    return new Promise((resolve, reject) => {
        let d = new Dialog({
            title: 'Handedness',
            content: '',
            buttons: {
                one: {
                    icon: '<i class="fas fa-poo"></i>',
                    label: 'One Handed',
                    callback: () => resolve('one')
                },
                two: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Two Handed',
                    callback: () => resolve('two')
                }
            },
            default: 'two',
        });
        d.render(true);
    })
}

async function longbow(opts) {
    let defaults = {
        damage: '1d8',
        abilityScore: 'dex',
        name: 'Longbow',
        crit: 20,
        proficiencies: ['mar', 'longbow'],
    };
    opts = {
        ...defaults,
        ...opts
    };
    opts.token = await chooseToken();
    opts.actorId = opts.token.document.actorId;

    if (opts.advantage == null && opts.advantage == null) {
        let advdis = await chooseMode();
        opts.advantage = advdis.advantage;
        opts.disadvantage = advdis.disadvantage;
    }

    doAttackRoll(opts);
}

async function shortsword(opts) {
    let defaults = {
        damage: '1d6',
        name: 'Shortsword',
        crit: 20,
        proficiencies: ['mar', 'shortsword'],
    };
    opts = {
        ...defaults,
        ...opts
    };
    opts.token = await chooseToken();
    opts.actorId = opts.token.document.actorId;
    if (!opts.abilityScore) opts.abilityScore = await chooseAbility(token.document.actorId);

    if (opts.advantage == null && opts.advantage == null) {
        let advdis = await chooseMode();
        opts.advantage = advdis.advantage;
        opts.disadvantage = advdis.disadvantage;
    }

    doAttackRoll(opts);
}

async function longsword({handedness, damage, ability, label, crit, reroll} = {}) {
    let defaults = {
        name: 'Longsword',
        crit: 20,
        proficiencies: ['mar', 'longsword'],
        abilityScore: 'str',
    };
    opts = {
        ...defaults,
        ...opts
    };
    opts.token = await chooseToken();
    opts.actorId = opts.token.document.actorId;
    if (!opts.abilityScore) opts.abilityScore = await chooseAbility(token.document.actorId);

    if (!opts.handedness) {
        opts.handedness = await chooseHandedness();
    }
    if (!opts.damage) {
        if (opts.handedness == 'two') {
            opts.damage = '1d10';
        } else {
            opts.damage = '1d8';
        }
    }

    if (opts.advantage == null && opts.advantage == null) {
        let advdis = await chooseMode();
        opts.advantage = advdis.advantage;
        opts.disadvantage = advdis.disadvantage;
    }

    doAttackRoll(opts);
}

async function dagger({damage, ability, label, crit, reroll} = {}) {
    let defaults = {
        name: 'Dagger',
        crit: 20,
        proficiencies: ['sim', 'dagger'],
        damage: '1d4',
    };
    opts = {
        ...defaults,
        ...opts
    };
    opts.token = await chooseToken();
    opts.actorId = opts.token.document.actorId;
    if (!opts.abilityScore) opts.abilityScore = await chooseAbility(token.document.actorId);

    if (!opts.handedness) {
        opts.handedness = await chooseHandedness();
    }
    if (!opts.damage) {
        if (opts.handedness == 'two') {
            opts.damage = '1d10';
        } else {
            opts.damage = '1d8';
        }
    }

    if (opts.advantage == null && opts.advantage == null) {
        let advdis = await chooseMode();
        opts.advantage = advdis.advantage;
        opts.disadvantage = advdis.disadvantage;
    }

    doAttackRoll(opts);
}

async function dart({damage, ability, label, crit, reroll} = {}) {
    let defaults = {
        name: 'Dart',
        crit: 20,
        proficiencies: ['sim', 'dart'],
        damage: '1d4',
    };
    opts = {
        ...defaults,
        ...opts
    };
    opts.token = await chooseToken();
    opts.actorId = opts.token.document.actorId;
    if (!opts.abilityScore) opts.abilityScore = await chooseAbility(token.document.actorId);

    if (opts.advantage == null && opts.advantage == null) {
        let advdis = await chooseMode();
        opts.advantage = advdis.advantage;
        opts.disadvantage = advdis.disadvantage;
    }

    doAttackRoll(opts);
}

async function warhammer({handedness, damage, ability, label, crit, reroll} = {}) {
    let defaults = {
        name: 'Warhammer',
        crit: 20,
        proficiencies: ['mar', 'warhammer'],
        abilityScore: 'str',
    };
    opts = {
        ...defaults,
        ...opts
    };
    opts.token = await chooseToken();
    opts.actorId = opts.token.document.actorId;
    if (!opts.abilityScore) opts.abilityScore = await chooseAbility(token.document.actorId);

    if (!opts.handedness) {
        opts.handedness = await chooseHandedness();
    }
    if (!opts.damage) {
        if (opts.handedness == 'two') {
            opts.damage = '1d10';
        } else {
            opts.damage = '1d8';
        }
    }

    if (opts.advantage == null && opts.advantage == null) {
        let advdis = await chooseMode();
        opts.advantage = advdis.advantage;
        opts.disadvantage = advdis.disadvantage;
    }

    doAttackRoll(opts);
}

async function spear({handedness, damage, ability, label, crit, reroll} = {}) {
    let defaults = {
        name: 'Spear',
        crit: 20,
        proficiencies: ['sim', 'spear'],
        abilityScore: 'str',
    };
    opts = {
        ...defaults,
        ...opts
    };
    opts.token = await chooseToken();
    opts.actorId = opts.token.document.actorId;
    if (!opts.abilityScore) opts.abilityScore = await chooseAbility(token.document.actorId);

    if (!opts.handedness) {
        opts.handedness = await chooseHandedness();
    }
    if (!opts.damage) {
        if (opts.handedness == 'two') {
            opts.damage = '1d8';
        } else {
            opts.damage = '1d6';
        }
    }

    if (opts.advantage == null && opts.advantage == null) {
        let advdis = await chooseMode();
        opts.advantage = advdis.advantage;
        opts.disadvantage = advdis.disadvantage;
    }

    doAttackRoll(opts);
}

async function javelin({damage, ability, label, crit, reroll} = {}) {
    let defaults = {
        name: 'Javelin',
        crit: 20,
        proficiencies: ['sim', 'javelin'],
        abilityScore: 'str',
        damage: '1d6',
    };
    opts = {
        ...defaults,
        ...opts
    };
    opts.token = await chooseToken();
    opts.actorId = opts.token.document.actorId;
    if (!opts.abilityScore) opts.abilityScore = await chooseAbility(token.document.actorId);

    if (opts.advantage == null && opts.advantage == null) {
        let advdis = await chooseMode();
        opts.advantage = advdis.advantage;
        opts.disadvantage = advdis.disadvantage;
    }

    doAttackRoll(opts);
}

async function lightCrossbow({damage, ability, label, crit, reroll} = {}) {
    let defaults = {
        name: 'Light Crossbow',
        crit: 20,
        proficiencies: ['sim', 'lightcrossbow'],
        abilityScore: 'dex',
        damage: '1d8',
    };
    opts = {
        ...defaults,
        ...opts
    };
    opts.token = await chooseToken();
    opts.actorId = opts.token.document.actorId;
    if (!opts.abilityScore) opts.abilityScore = await chooseAbility(token.document.actorId);

    if (opts.advantage == null && opts.advantage == null) {
        let advdis = await chooseMode();
        opts.advantage = advdis.advantage;
        opts.disadvantage = advdis.disadvantage;
    }

    doAttackRoll(opts);
}

Hooks.on('ready', () => {
    console.log('Daniels Data ready');
    console.log(game);
})
