---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'A Little Blazor Shillery'
pubDate: '2024-11-20T00:00:00'
description: 'A few things to say about my favorite web technology.'
tags: ["Blazor", ".NET"]
---

# A Little Blazor Shillery

## Why do we keep doing this to ourselves?

I think we can all agree that Typescript is a good thing. It offers simple improvements to an already useful language, appending features that most devs agree should be standardized, but for reasons of bureacracy and backwards compatibility won't be (or at least won't be for a long while). The additive type support is without a doubt a win; it offers a needed restriction to a language that badly suffers from giving its users too much leniency.

There's a larger point to be made here: developers consider more restrictions on a language to be a _good_ thing. Without a belt, your pants would sag. They'd still perform their necessary function, but they have a limitation. There's a risk that they may fall down, embarassing yourself at the office Christmas party again. Typescript is a belt. But JavaScript is not a pair of jeans, it's more like a mesh article. JavaScript is a language which offers a ton of flexibility and freedom to developers, maybe even a little too much. Thus we end up with piles of spaghetti that technically work but are difficult to maintain and tedious to augment. We have built empires on top this language that was written in _less than a month_. It's a triumph of engineering, but not one I really think our profession should continue to cling to as **the web standard**.

This is just one example of a bandaid, in an industry famous for its band-aids. I would argue that any Node framework is a good example of a band-aid, actually a pretty good one! Components? Yes please. Services and dependency injection? Hello! A rich package ecosystem? Don't mind if I do, just make sure it's set up to avoid another incident like _leftpad._ But there's something _all_ of these front-end frameworks do wrong. They all use JavaScript! And I don't understand why it has to be the way. Because that's the way it's always been done? Because you were just following orders? Nonsense! Node had the right idea when they proposed that an entire application stack be _monolingual_. But they got it backwards.

## It Doesn't Have To Be Like This

In comes Blazor. It's a full-stack web development framework written for .NET. It's pretty good. You write your HTML the same way you'd write a Razor page, but with better template interpolation. You write your control logic in the block below all that. You can componetize code, or make the file a page by adding a <code>@page</code> directive at the top. There's JavaScript if you want it (when it's needed, which isn't often nor is it never) via an interoperability API that is both convenient and simple.

Earlier this year I built Forehead, a golf application, and I chose to do it in Svelte. I'd seen Svelte floating around for a while. I had heard that it borrowed the right things from React while discarding the bad, and I wanted to give myself a new skill in the front end world. It was a mistake! But here's the really twisted part: I actually really like Svelte. It's head-and-shoulders above everything else I've tried in the Node ecosystem. But it's not Blazor. It's not even close.

Building things in Blazor is just easy. Earlier this year, while working on a new project, my counterpart leaned over to me and asked "Why is this so easy?" He had built a modal that executed some critical program logic in just one hour. He strung together a few components from an existing library (I have high praise for Radzen), spent a few minutes using Visual Studio's debugging tool to work out the kinks, and he was done. It was nothing fancy, but neither was the code. And that's a good thing. Blazor gave him the tooling he needed to craft something that is not difficult to maintain or tedious to augment - Blazor gave him the ability to create something easily that doesn't suck. 

## Advocacy in Action

Like anything else, getting people who have never heard of a new technology to adopt that technology is, in practice, really difficult. I've given lots of presentations about Blazor to large groups, demonstrating success my teams have had with it and how nice the development experience can be. The amount of enthusiasm I get from people who are unfamiliar with it is almost exactly 0. No one gives a shit. Frankly, I get it. If I had to listen to some nerd who doesn't even work for Microsoft shill for a Microsoft offering this hard, I'd probably tune out in the first five minutes.

On the other hand, the response I get from people who _do_ know a little bit about Blazor is genuinely fantastic. Oftentimes they're disillusioned front-enders, or they're .NET fanatics who see the potential change as a liberation. There are lots of people who are hungry for a new web technology, if you know where to look for them.

Inertia takes time to build. First you explain something to someone, and they don't really care, but that knowledge sticks to them slightly. Then maybe they hear about it again later, and their ears perk up, because they understand the reference. Then maybe at some point they go to a conference and someone is there to talk about the subject, or they undertake a quick personal project on their off hours to learn the skill. And then they either like it, or they don't. My experience with Blazor is that people tend to like it very much, if they ever get to this point. This might be a fine way to grow awareness, but it's sluggish and ineffective at growing actual honest on-the-ground use.

The only real advocacy I've had any success with has been personal action and exerting pressure. Talking people into using it, and then helping them succeed is the only way to generate any real interest in this technology. I've had more success this way than any other - people need to see it work, they need to feel that they "get it". So for every new project, I try and find an angle and pitch. I would suggest other Blazor zealots take this approach as well.

## The End of History

It's easy, in our still young industry, to imagine that we live at the end of history - that the current way of doing things is the best because it's what we have _now_. But life is not a meritocracy - sometimes ideas win just because. I'm glad to see that there are other frontiers forming for web development. Every year there are new technologies that make our current JS-rich ecosystem look a little more backwards. Blazor is one example of this, and it's one that I wish more people would take note of. I'll keep fighting my little fight for it until it either sucks or gets overtaken by something even better.