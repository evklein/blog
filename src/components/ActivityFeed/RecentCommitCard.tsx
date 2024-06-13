import "../../styles/activity-feed.css";
import type { CommitDetails } from './ActivityFeed';
import { getReadableTimespanString } from "./SharedActivityFeedBehavior";

interface RecentCommitCardProps {
    commit: CommitDetails;
};

export default function RecentCommitCard(props: RecentCommitCardProps) {
    return (
        <>
            <div class="activity-item-card">
                <div class="card-left">
                    <div class="commit-primary-details">
                        <i class="card-icon fa-solid fa-code-commit"></i>&nbsp;
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
