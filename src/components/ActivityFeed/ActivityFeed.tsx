import { useState, useEffect } from 'preact/hooks';
import "../../styles/activity-feed.css";
import type { MarkdownInstance } from 'astro';
import RecentCommitCard from './RecentCommitCard';
import RecentBlogPostCard from './RecentBlogPostCard';

interface RecentCommitsProps {
    blogPosts: MarkdownInstance<Record<string, any>>[];
};

interface CommitReference {
    url: string;
    repository: {
        name: string;
    }
}

interface CardInfo {
    type: string;
}

export interface CommitDetails extends CardInfo {
    hash: string;
    repository: string;
    date: string;
    message: string;
    numberOfAdditions: number;
    numberOfDeletions: number;
    numberOfFilesModified: number;
    viewLink: string;
}

export interface BlogPostRecord extends CardInfo {
    title: string;
    date: string;
    url: string;
}

export default function RecentCommits(props: RecentCommitsProps) {
    const [selectedTab, setSelectedTab] = useState<string>("all");
    const [commits, setCommits] = useState<CommitDetails[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPostRecord[]>([]);

    function fetchMostRecentCommitReferences() {
        const SEARCH_ENDPOINT = "https://api.github.com/search/commits?q=author:evklein&sort=author-date&order=desc&page=1";
        fetch(SEARCH_ENDPOINT)
        .then(response => response.json())
        .then(data => {
            let mostRecentFiveCommits = data["items"].slice(0, 5);
            mostRecentFiveCommits.forEach((commit: CommitReference) => {
                fetchCommitDetails(commit["url"], commit["repository"]["name"]);
            })
        });
    }

    function fetchCommitDetails(commitUrl: string, repository: string) {
        fetch(commitUrl)
            .then(response => response.json())
            .then(data => {
                let commitDetails: CommitDetails = {
                    type: "git-commit",
                    hash: data["sha"],
                    repository,
                    date: data["commit"]["author"]["date"],
                    message: data["commit"]["message"],
                    numberOfAdditions: data["stats"]["additions"],
                    numberOfDeletions: data["stats"]["deletions"],
                    numberOfFilesModified: data["files"].length,
                    viewLink: data["html_url"],
                };
                setCommits(commits => [...commits, commitDetails]);
            });
    }

    useEffect(() => {
        fetchMostRecentCommitReferences();

        props.blogPosts.forEach((blogPost: any) => {
            setBlogPosts(blogPosts => [...blogPosts, {
                type: "blog-post",
                title: blogPost["frontmatter"]["title"],
                date: blogPost["frontmatter"]["pubDate"],
                url: blogPost["url"]
            }]);
        })
    }, [props.blogPosts]);

    function getItemsToDisplay(): CardInfo[] {
        let combinedInfo = [...commits, ...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);
        switch (selectedTab) {
            case "code":
                return combinedInfo.filter(item => item.type === "git-commit");
            case "posts":
                return combinedInfo.filter(item => item.type === "blog-post");
            default:
                return combinedInfo;
        }
    }

    function getCardComponentForActivityItem(activityDetails: CardInfo, keyIndex: number) {
        switch (activityDetails.type) {
            case "git-commit":
                return <RecentCommitCard key={keyIndex} commit={activityDetails as CommitDetails} />;
            case "blog-post":
                return <RecentBlogPostCard key={keyIndex} post={activityDetails as BlogPostRecord} />;
            default:
                return null;
        }
    }

    return (
        <>
            <h2 class="activity-title">
                <div class="activity-title-text-wrapper">
                    <i class="fa-solid fa-bars-progress"></i>&nbsp;&nbsp;Recent Activity
                </div>
                <div class="tabs">
                    <span class={`tab-option ${selectedTab === 'all' ? 'selected' : null}`} href="" alt="All" onClick={() => setSelectedTab('all')}>
                        <i class="fa-solid fa-asterisk"></i>
                    </span>
                    <span class={`tab-option ${selectedTab === 'code' ? 'selected' : null}`} href="" alt="Code" onClick={() => setSelectedTab('code')}>
                        <i class="fa-solid fa-code-merge"></i>
                    </span>
                    <span class={`tab-option ${selectedTab === 'posts' ? 'selected' : null}`} href="" alt="Posts" onClick={() => setSelectedTab('posts')}>
                        <i class="fa-solid fa-newspaper"></i>
                    </span>
                </div>
            </h2>
            <div class="activity-items-wrapper">
                {getItemsToDisplay().map((activity, index) => getCardComponentForActivityItem(activity, index))}
            </div>
        </>
    );
}
