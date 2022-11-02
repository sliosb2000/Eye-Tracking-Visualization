import React from "react";

interface Props {
    messages: string[];
    width?: string;
    height?: string;
    backgroundColor?: string;
    scrollToBottom?: boolean;
}

interface State {

}

class MessageCard extends React.Component<Props, State> {

    private eventEndRef = React.createRef<HTMLDivElement>();

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    private scrollToBottom = () => {
        this.eventEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    render() {
        return (
            <div
                className="message-container"
                style={{
                overflowY: "scroll",
                width: this.props.width,
                height: this.props.height,
                backgroundColor: this.props.backgroundColor,
                }}
            >
                <div className="message-list">
                {this.props.messages.map((message) => (
                    <div>
                        {message}
                    </div>
                ))}
                </div>
                <div style={{ float:"left", clear: "both" }}
                    ref={this.props.scrollToBottom ? this.eventEndRef : undefined}>
                </div>
            </div>
        )
    }
}

export default MessageCard;