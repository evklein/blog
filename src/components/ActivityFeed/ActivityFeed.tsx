import { useState, useEffect } from 'preact/hooks';
import "../../styles/activity-feed.css";
import type { MarkdownInstance } from 'astro';
import RecentCommitCard from './RecentCommitCard';
import RecentBlogPostCard from './RecentBlogPostCard';
import ErrorNotification from './ErrorNotification';

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
    date: string;
}

export interface CommitDetails extends CardInfo {
    hash: string;
    repository: string;
    message: string;
    numberOfAdditions: number;
    numberOfDeletions: number;
    numberOfFilesModified: number;
    viewLink: string;
}

export interface BlogPostRecord extends CardInfo {
    title: string;
    url: string;
}

export default function RecentCommits(props: RecentCommitsProps) {
    const [selectedTab, setSelectedTab] = useState<string>("posts");
    const [commits, setCommits] = useState<CommitDetails[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPostRecord[]>([]);
    const [gitApiFailStatus, setGitApiFailStatus] = useState<boolean>(false);

    function fetchMostRecentCommitReferences() {
        const SEARCH_ENDPOINT = "https://api.github.com/search/commits?q=author:evklein&sort=author-date&order=desc&page=1";
        fetch(SEARCH_ENDPOINT)
        .then(response => {
            if (!response.ok) throw new Error("Git search query failed");
            return response.json()
        })
        .then(
            (data) => {
                let mostRecentFiveCommits = data["items"].slice(0, 12);
                mostRecentFiveCommits.forEach((commit: CommitReference) => {
                    fetchCommitDetails(commit["url"], commit["repository"]["name"]);
                });
                setGitApiFailStatus(false);
            }
        ).catch(error => {
            console.log(error);
            setGitApiFailStatus(true);
        });
    }

    function fetchCommitDetails(commitUrl: string, repository: string) {
        fetch(commitUrl)
            .then(response => {
                if (!response.ok) throw new Error("Git commit detail fetch failed");
                return response.json();
            })
            .then(
                (data) => {
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
                    setGitApiFailStatus(false);
                },
            ).catch(error => {
                console.error(error);
                setGitApiFailStatus(true);
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

    function cardSortByDateHandler(a: CardInfo, b: CardInfo) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
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

    function getFeedContent() {
        let cards: CardInfo[] = [];
        let gitErrorMessage = gitApiFailStatus ? <ErrorNotification errorMessage='Git events could not be fetched. Please try again later.' /> : null;
        switch (selectedTab) {
            case "code":
                cards = commits ? commits.sort(cardSortByDateHandler).slice(0, 15) : [];
                break;
            case "posts":
                gitErrorMessage = null; // Don't show errors when all user is viewing are posts
                cards = blogPosts ? blogPosts.sort(cardSortByDateHandler).slice(0, 6) : [];
                break;
            default:
                cards = [...commits, ...blogPosts].sort(cardSortByDateHandler);
                break;
        }
        
        return(
            <>
                {gitErrorMessage}
                {cards.map((activity, index) => getCardComponentForActivityItem(activity, index))}
            </>
        );
    }

    return (
        <>
            <h2 class="activity-title">
                <div class="activity-title-text-wrapper">
                    <i class="fa-solid fa-bars-progress"></i>&nbsp;&nbsp;Recent Activity
                </div>
                <div class="tabs">
                    <span class={`tab-option ${selectedTab === 'posts' ? 'selected' : null}`} onClick={() => setSelectedTab('posts')}>
                        <i class="fa-solid fa-newspaper"></i>
                    </span>
                    <span class={`tab-option ${selectedTab === 'code' ? 'selected' : null}`} onClick={() => setSelectedTab('code')}>
                        <i class="fa-solid fa-code-merge"></i>
                    </span>
                    <span class={`tab-option ${selectedTab === 'all' ? 'selected' : null}`} onClick={() => setSelectedTab('all')}>
                        <i class="fa-solid fa-asterisk"></i>
                    </span>
                </div>
            </h2>
            <div class="activity-items-wrapper">
                {getFeedContent()}
            </div>
        </>
    );
}
