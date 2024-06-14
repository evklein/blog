import "../../styles/activity-feed.css";

interface ErrorNotificationProps {
    errorMessage: string;
};

export default function ErrorNotification(props: ErrorNotificationProps) {
    return (
        <>
            <div className="error-notification-card">
                <i class="error-icon fas fa-exclamation-triangle"></i>
                {props.errorMessage}
            </div>
        </>
    );
}
