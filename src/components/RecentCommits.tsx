import { useState, useEffect } from 'preact/hooks';
import "../styles/recent-commits.css";
import type { MarkdownInstance } from 'astro';

interface RecentCommitsProps {
    blogPosts: MarkdownInstance<Record<string, any>>[];
};

interface CommitReference {
    url: string;
    repository: {
        name: string;
    }
}

interface CommitDetails {
    hash: string;
    repository: string;
    date: string;
    message: string;
    numberOfAdditions: number;
    numberOfDeletions: number;
    numberOfFilesModified: number;
}

interface BlogPostRecord {
    title: string;
    date: string;
    url: string;
}

export default function RecentCommits(props: RecentCommitsProps) {
    const [commits, setCommits] = useState<CommitDetails[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPostRecord[]>([]);

    function getCommitDetails(commitUrl: string, repository: string) {
        fetch(commitUrl)
            .then(response => response.json())
            .then(data => {
                let commitDetails: CommitDetails = {
                    hash: data["sha"],
                    repository,
                    date: data["commit"]["author"]["date"],
                    message: data["commit"]["message"],
                    numberOfAdditions: data["stats"]["additions"],
                    numberOfDeletions: data["stats"]["deletions"],
                    numberOfFilesModified: data["files"].length,
                };
                setCommits(commits => [...commits, commitDetails]);
            });
    }

    useEffect(() => {
        fetch("https://api.github.com/search/commits?q=author:evklein&sort=author-date&order=desc&page=1")
            .then(response => response.json())
            .then(data => {
                let mostRecentFiveCommits = data["items"].slice(0, 5);
                mostRecentFiveCommits.forEach((commit: CommitReference) => {
                    getCommitDetails(commit["url"], commit["repository"]["name"]);
                })
            });

        props.blogPosts.forEach((blogPost: any) => {
            setBlogPosts(blogPosts => [...blogPosts, {
                title: blogPost["frontmatter"]["title"],
                date: blogPost["frontmatter"]["pubDate"],
                url: blogPost["url"]
            }]);
        })
    }, []);

    function getReadableTimespanString(fromDateString: string) {
        let fromDate = new Date(fromDateString);
        let toDate = new Date();
        let timeBetweenInSeconds = Math.abs(toDate.getTime() - fromDate.getTime()) / 1000;

        let secondsInAMinute = 60;
        let secondsInAnHour = 60 * secondsInAMinute;
        let secondsInADay = 24 * secondsInAnHour;
        let secondsInAMonth = 30 * secondsInADay;
        let secondsInAYear = 12 * secondsInAMonth;

        if (timeBetweenInSeconds < secondsInAMinute) return "less than a minute ago";
        if (timeBetweenInSeconds < secondsInAnHour) return `${finalizeReadableTimespanString(Math.floor(timeBetweenInSeconds / secondsInAMinute), "minute")}`;
        if (timeBetweenInSeconds < secondsInADay) return `${finalizeReadableTimespanString(Math.floor(timeBetweenInSeconds / secondsInAnHour), "hour")}`;
        if (timeBetweenInSeconds < secondsInAMonth) return `${finalizeReadableTimespanString(Math.floor(timeBetweenInSeconds / secondsInADay), "day")}`;
        if (timeBetweenInSeconds < secondsInAYear) return `${finalizeReadableTimespanString(Math.floor(timeBetweenInSeconds / secondsInAMonth), "month")}`;
        else return "A long time ago";
    }

    function finalizeReadableTimespanString(displayNumber: number, timeIncrement: string) {
        return `${displayNumber} ${timeIncrement}${displayNumber > 1 ? 's' : ''} ago`
    }

    return (
        <>
            <h2 class="activity-title">
                <div class="activity-title-text-wrapper">
                    <i class="fa-solid fa-bars-progress"></i>&nbsp;&nbsp;Recent Activity
                </div>
                <div class="tabs">
                    <a class="tab-option selected" href="" alt="All">
                        <i class="fa-solid fa-asterisk"></i>
                    </a>
                    <a class="tab-option" href="" alt="Code">
                        <i class="fa-solid fa-code-merge"></i>
                    </a>
                    <a class="tab-option" href="" alt="Posts">
                        <i class="fa-solid fa-newspaper"></i>
                    </a>
                </div>
            </h2>
            <div class="activity-items-wrapper">
                {commits.map(commit =>
                    <div class="commit-record">
                        <div class="commit-record-left">
                            <div class="commit-primary-details">
                                <i class="fa-solid fa-code-commit"></i>&nbsp;
                                <div class="changes">
                                    <span class="additions">+{commit.numberOfAdditions}</span> / <span class="deletions">-{commit.numberOfDeletions}</span>
                                </div>
                                <div>&nbsp;committed to&nbsp;</div>
                                <div class="commit-repository"><b><i>{commit.repository}</i>&nbsp;</b></div>
                                <div class="commit-message">
                                    |&nbsp;<i class="fa-regular fa-message"></i>&nbsp;
                                    {commit.message}
                                </div>
                            </div>
                            <div class="commit-secondary-details">
                                <div class="date">{getReadableTimespanString(commit.date)}</div>
                            </div>
                        </div>
                        <div class="commit-hash">
                            <a href="">
                                {commit.hash.slice(0, 6)}
                            </a>
                        </div>
                    </div>
                )}
                {blogPosts.map(blogPost =>
                    <div class="commit-record">
                        <div class="commit-record-left">
                            <div class="commit-primary-details">
                                <i class="fa-solid fa-newspaper"></i>&nbsp;
                                <div>Published new blog post: <b class="emphasize">{blogPost.title}</b></div>
                            </div>
                            <div class="commit-secondary-details">
                                <div class="date">{getReadableTimespanString(blogPost.date)}</div>
                            </div>
                        </div>
                        <div class="commit-hash">
                            <a href="">
                                <i class="fa-solid fa-link"></i>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
