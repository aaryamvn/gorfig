# **Gorfig (WIP)**

Making a discord bot for a specific server? Gorfig automatically populates the codebase for your bot with vital guild-specific information and it's types.

### **Supports**

- Channel Information
- Role Information
- Emoji Information
- Sticker Information
- Webhook Information

<br>

## **How To Use Gorfig**

DISCLAIMER: this section is highly conceptual and is a WIP

### Add Gorfig Bot to your Discord Server

First, you need to add the <a>Gorfig Discord Bot</a> to the guild you want to obtain information for.

### Initialize Gorfig in your Codebase

```bash
> cd my_bot_codebase
> npm install gorfig
> gorfig init
```

### Populate your Codebase with Guild Information

```bash
> gorfig populate
```

<br>

## **Use Case**

**When you're** building a tool or a bot for a _specific_ discord server, it's likely you'll need to work with common data or "information" for features like roles, channels, and more. This data is usually extracted manually and put into a certain file of your codebase.

**For example**, if you needed the IDs and Names of every single role in your guild, manually obtaining it can become time-consuming.

<br>

## **Contributing**

This project is lead by <a href="https://twitter.com/aaryamvn">@aaryamvn</a> (Aaryaman Maheshwari).

If you are interested in contributing to this project, make a pull request into the `dev` branch. Please ping `aaryaman#0001` in the <a href="">Gorfig Discord Server</a> prior to making any form of contribution.
