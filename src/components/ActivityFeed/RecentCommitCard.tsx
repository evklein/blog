import "../../styles/activity-feed.css";
import type { CommitDetails } from './ActivityFeed';
import { getReadableTimespanString } from "./SharedActivityFeedBehavior";

interface RecentCommitCardProps {
    commit: CommitDetails;
};

export default function RecentCommitCard(props: RecentCommitCardProps) {
    function getAppropriateIconForCommitType() {
        let commitMessage = props.commit.message;
        if (commitMessage.startsWith(`Merge pull request #`)) return "code-pull-request";
        if (commitMessage.startsWith(`Merge branch '`)) return "code-merge";
        return "code-commit";
    }

    function getAppropriateDetailForCommitType() {
        let commitMessage = props.commit.message;
        if (commitMessage.startsWith(`Merge pull request #`)) return "PULL REQUEST CLOSED";
        if (commitMessage.startsWith(`Merge branch '`)) return "BRANCH MERGED";
        return commitMessage;
    }

    return (
        <>
            <div class="activity-item-card">
                <div class="card-left">
                    <div class="commit-primary-details">
                        <i class={`card-icon fa-solid fa-${getAppropriateIconForCommitType()}`}></i>&nbsp;
                        <span class="changes">
                            <span class="additions">+{props.commit.numberOfAdditions}</span> / <span class="deletions">-{props.commit.numberOfDeletions}</span>
                        </span>
                        &nbsp;committed to&nbsp;
                        <span class="emphasize">{props.commit.repository}</span>
                    </div>
                    <div class="commit-message">
                            &nbsp;<i class="fa-regular fa-message"></i>&nbsp;
                            {props.commit.message}
                        </div>
                    <div class="commit-secondary-details">
                        <div class="date">{getReadableTimespanString(props.commit.date)}</div>
                    </div>
                </div>
                <div class="card-right">
                    <div class="commit-hash">
                        <a href={props.commit.viewLink}>
                            {window.innerWidth > 768 ? props.commit.hash.slice(0, 6) : props.commit.hash.slice(0, 4)}
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
