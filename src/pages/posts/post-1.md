---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Quixotic Testing'
pubDate: 2024-01-19
description: '100% code coverage is a noble pursuit, no matter the quixotism.'
image:
    url: ''
    alt: 'The full Astro logo.'
tags: ["Testing"]
---
# Intro

I was interviewing for a new job recently. The interview was interesting, for a lot of reasons (maybe perhaps I'll detail this story in a later post), but one notable thing was the pace. I was peppered with questions ranging from system architecture to cloud concepts at a brisk speed, so a lot of ground was covered in the short hour. One question from the hiring manager has stuck with me. The conversation went something like this.

**INTERVIEWER:** Should 100% test coverage be the goal?

**Me:** Probably not. It can be a goal, sure, but it's not always realistic. Unless you want to spend 2/3 of your sprint writing unit tests...

That was it. We moved on to a sample code review, and the testing questions were left where they lay. But it got me thinking...

Writing tests _is_ important. Every team I have ever worked on has valued that work (though maybe not as much as they should have). Some teams even have dedicated QA engineers who _only_ focus on testing. Testing engineers are important, and they do something important. It's hard, oftentimes thankless work. In terms of woodworking, testing (to me) is like finish work. Sanding, staining, finishing, polishing... I hate that part. It's a barrier to finishing the project. But I can admit that that's not the right attitude. Those things are part of the project, whether I enjoy doing them or not.

## My First Release

My second week of my first job was exciting. Despite the insanity of the world around me at the time (June, 2020, reaaalll good times for everyone), I was still excited to be starting my career. Another first came this week: my first _real_ software release! I was excited to see what kinds of things my company was doing to keep up in this fast-moving computing world. Trunk based development, automatic CI/CD, hourly deployments to elastic cloud services in half a dozen availability zones, I was ready for it all. I was a real engineer now, and it was time to do real engineering stuff.

What I found was not in line with my expectations. Our CI/CD that took 30+ minutes, and oftentimes failed for seemingly no reason at all. Our release process was not an elegant, automated pipeline that took reviewed code from pull request to our user's digital doorstep, but instead a stack of paperwork that required sign-off from no less than 3 people for even a minor patch release. But the worst thing, by far, was the testing. Our projects had unit tests, of course they did. But our end-to-end testing was a different story. Those tests consisted of an excel spreadsheet a mile long, with _thousands_ of handwritten tests. Many tests were hard to understand, outdated, or wrong. The real kicker was that at this point we were still committed to supporting all major browsers, which meant running this spreadsheet four times, one for each browser (Chrome, Edge, Firefox and _shudders_ IE). As the new engineer on our team, I had the privilege of running these tests for the new release (they only had me do 3 of the browsers, thankfully), which happened to involve a major .NET version upgrade, which meant everything needed to be tested as if it had never been touched before. Subsequent releases were not much better, with the additional workload of having to go through the spreadsheet and painstakingly update any affected test cases. These sheets continued to plague my team for 2 years, until we transitioned to a new system.

## A Hell of Our Own Creation

# A Brave New World

We shouldn't be afraid to achieve 100% coverage.

### Why isn't 100% code coverage realistic?

###




