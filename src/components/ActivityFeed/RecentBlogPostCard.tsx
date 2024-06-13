import "../../styles/activity-feed.css";
import type { BlogPostRecord, CommitDetails } from './ActivityFeed';
import { getReadableTimespanString } from "./SharedActivityFeedBehavior";

interface RecentBlogPostCardProps {
    post: BlogPostRecord;
};

export default function RecentBlogPostCard(props: RecentBlogPostCardProps) {
    return (
        <>
            <div class="activity-item-card">
                <div class="card-left">
                    <div class="primary-details">
                        <i class="card-icon fa-solid fa-newspaper"></i>&nbsp;
                        <div>Published new blog post: <b class="emphasize">{props.post.title}</b></div>
                    </div>
                    <div class="secondary-details">
                        <div class="date">{getReadableTimespanString(props.post.date)}</div>
                    </div>
                </div>
                <div class="card-right">
                    <div class="post-link">
                        <a href={props.post.url}>
                            <i class="fa-solid fa-link"></i>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
