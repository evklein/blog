---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Introducing Evicons'
pubDate: 2024-05-24
description: ''
tags: ["astro", "blogging", "learning in public"]
---
# Introducing Evicons

## How it started
I like Github identicons. They're kind of charming, you know? Something simple to give your users to distinguish themselves. I kept [mine](https://github.com/identicons/evklein.png) as my main profile picture for a long time.

![Alt text](image-3.png)

I also like the idea of building my own identicons, so I decided to build something for this blog, to distinguish between pages, posts, or projects. You've probably seen them floating around on this site (there's one at the top of this post). I thought I'd document the process here.

## To each its own

Github identicons are unique to their user, and are calculated via a cryptographic hash of the user's username (according to [this post](https://github.blog/2013-08-14-identicons/)). I like the cryptography aspect of this, but I think we can use the seed in a more interesting way, but I'll get to that. The point is, our identicons should be ***cryptographically distinct***, deterministic of their output. An Evicon should never be shared by the same seed. To accomplish this, we can do the same thing that Github does and pass the 'seed' value through a cryptographic hash function. We'll work with MD5 for this implementation.

Fun fact: I learned that Github identicons only use the _first fifteen_ characters of their hash for their image generation. So while it's practically not possible, one could theoretically find two usernames that share an identicon. We'll account for this in our own implementation to ensure that each seed actually has no shared evicons.


## A whole lotta noise

I think an animation would be nice, and with our MD5 hash we should have plenty of information we can use to 'seed' the animation, at least for some initial state. I've opted to use <a href="https://wikipedia.org/perlin_noise">Perlin noise</a> to generate the animation. Perlin noise is a pretty popular algorithm, especially in the game development space, and is most often used to generate noise maps for terrain generation. It has a nice effect to it, so I built my own implementation that can accept an input seed and generate a completely unique animation ot that seed. I'm not going to walk through all the code for this, but I will document the important parts as well as some struggles I ran into along the way.

The algorithm goes, roughly, like this:

1. Define a grid. Place vectors at every intersection of the grid lines in random directions. These are our **Gradient Vectors**. Normalize them.

2. For each pixel in our image, find the four grid corners that surround it, and draw four more vectors for this pixel, with the origin being at its respective corner and its end coordinates laying at the pixel's position. These are our **Offset Vectors**.

3. For each of our offset vectors, find the respective Gradient Vectors and calculate a dot product between the vectors. Store these four dot products in a list.

4. Interpolate the dot products, first along the x-axis, and then once more along the y-axis. This final interpolation is our **perlin noise value at that point.**

5. Use our perlin noise value and interpolate it between our primary and secondary color to get the final pixel hue.

6. Repeat for all pixels in the image.

Done! Not without some headaches, but I did eventually get an implementation of this working in Vanilla JS, and that's ultimately what you can see on this site.

#### Animating

The above algorithm only generates a single perlin noise image, but we want an animation of that noise. We can loop two additional steps to this algorithm to achieve the animation:

7. Rotate each **Gradient Vector** slightly.

8. Re-render all pixels.

The re-calculation of the gradient vectors will cause the pixel hue to be recalculated just slightly. As the vectors continue to rotate, they'll approach their initially set positions, and then the animation begins from the beginning.

And that's pretty much it!

### What about the seed value?

In step #1 I mentioned that the Gradient Vectors should be assigned to a "random" direction, but we already _have_ a random value! We can simply use the MD5 hash of our seed to get the _i_ and _j_ values for each vector, and continue looping through the characters of the hash 2 at a time to build a list of vectors.

Two characters of our hash will yield two digits of a base-16 number, which translates to a number in decimal ranging between **0 and 256**. That gives us plenty of range of direction, but what if we want some of our vectors to be pointing in _negative_ directions? Well, let's establish certain character values of the hash as indicating a negative direction. We can use entries of the Fibonacci sequence to choose the indices that we will use for these characters, and then we can update the direction vectors by multiplying them against these values:

```

    function getFibonacciSequence() {
        let fibonacciSequence = [];
        let n1 = 1, n2 = 2; // Offset Fibonacci so we always get different numbers
        let numberOfSequenceItems = (NUMBER_OF_SEGMENTS + 1) * (NUMBER_OF_SEGMENTS + 1) * 2;
        for (let i = 0; i < numberOfSequenceItems; i++) {
            fibonacciSequence.push(n1);
            let nextTerm = n1 + n2;
            n1 = n2;
            n2 = nextTerm;
        }
        return fibonacciSequence;
    }

    function getRandomDirectionByHash(hash, index) {
        while (index > hash.length) index -= hash.length;
        return parseInt(hash[index], 16) < 8 ? -1 : 1;
    }

```

And then below, when we build our Gradient Vectors

```

    for (let y = 0; y <= NUMBER_OF_SEGMENTS; y++) {
        for (let x = 0; x <= NUMBER_OF_SEGMENTS; x++) {
            let originX = x * gridSegmentPxWidth;
            let originY = y * gridSegmentPxHeight;
            let nextSeedX = parseInt(hash.substring(seedIncrement, seedIncrement + 2), 16) *
                getRandomDirectionByHash(hash, fibonacciSequence[directionIncrement++]);
            let nextSeedY = parseInt(hash.substring(seedIncrement + 2, seedIncrement + 4), 16) *
                getRandomDirectionByHash(hash, fibonacciSequence[directionIncrement++]);

    ...

```

### A pop of color

There's 16 bytes in an MD5 hash, rendered as a hexidecimal string of 32 characters, like this:

`e9026fb12e314ddb41cdd8529536f581`

I've decided that Evicons should be made primarily of two colors, so we can simply use the first 12 characters here to come up with two color codes, and we're done.

<div style="width: 200px; display: flex; text-align: center; margin: auto;">
    <span style="border-radius: 30px; display: block; width: 45px; height: 30px; background-color: #e9026f; margin-right: 5px;"></span>
    <i style="margin-right: 10px;">#e9026f</i>
    <span style="margin-right: 10px">&</span>
    <span style="margin-right: 5px; border-radius: 30px; display: block; width: 45px; height: 30px; background-color: #b12e31"></span>
    <i>#b12e31</i>
</div>

When we build the animation, we can interpolate these two colors together using the outputted perlin value, and the result is some sort of gradient between the two. Don't ask me to explain this any further, I'll fully own up to the fact that I was tired and ChatGPT wrote this part for me.

```

    function interpolateColor(color1, color2, perlinFactor) {
        const result = color1.slice();
        for (let i = 0; i < 3; i++) {
            result[i] = Math.round(result[i] + perlinFactor * (color2[i] - color1[i]));
        }
        return result;
    }

```

## Drawbacks

There's a few drawbacks to our Perlin Noise approach to the Evicon, (I've affectionately dubbed the script `eviconsV1.js` for a reason) worth going over.

1. They're needlessly complicated.

2. It's fairly easy to generate an Evicon that resembles another one, so they're not really all that good at _identifying_ anything, even if they offer a decent approximation.

2. Perlin Noise has a time complexity of **O(2<sup>n</sup>)**, so it's fairly slow. I haven't seen much dip in browser performance, but it's something I'll have to keep on as the site grows. <a href="">Simplex noise</a> is an alternative (also developed by Ken Perlin) that might be a better candidate for next time.


## Fin

This was fun, I love the way they look, and I think they add a nice bit of visual flair to the site that you won't see elsewhere. You can mess around with creating your own Evicons [here](/evicons) (⬅️ credit to <b>@JVanAuken</b> for the idea to build this page).