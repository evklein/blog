import { useState, useEffect } from 'preact/hooks';
import "../styles/recent-commits.css";

interface RecentCommitsProps {
    blogPosts: [];
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
        if (timeBetweenInSeconds < secondsInAnHour) return `${Math.floor(timeBetweenInSeconds / secondsInAMinute)} minutes ago`;
        if (timeBetweenInSeconds < secondsInADay) return `${Math.floor(timeBetweenInSeconds / secondsInAnHour)} hours ago`;
        if (timeBetweenInSeconds < secondsInAMonth) return `${Math.floor(timeBetweenInSeconds / secondsInADay)} months ago`;
        if (timeBetweenInSeconds < secondsInAYear) return `${Math.floor(timeBetweenInSeconds / secondsInAMonth)} months ago`;
        else return "a long time ago";
    }

    return (
        <>
            <h2><i class="fa-solid fa-bars-progress"></i>&nbsp;&nbsp;Recent Activity</h2>
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
        </>
    );
}
