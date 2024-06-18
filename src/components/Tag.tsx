import CryptoJS from 'crypto-js';

interface TagProps {
    name: string;
};

export default function Tag(props: TagProps) {
    function getTagColor() {
        let tagHash = CryptoJS.MD5(props.name).toString();
        return tagHash.substring(0, 6);
    }

    return (
        <>
            <span style={`background-color: #${getTagColor()}`} class="tag">{props.name}</span>
        </>
    );
}
