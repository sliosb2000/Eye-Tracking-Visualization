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

    private messagesEnd: HTMLDivElement | null = null;
    private messageContainer: HTMLDivElement | null = null;

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    private scrollToBottom = () => {
        if (this.messagesEnd && this.messageContainer) {
            this.messageContainer.scrollTo({
                top: this.messagesEnd.offsetTop,
                behavior: "smooth",
            });
        }   
    }

    render() {
        return (
            <div
                className="message-container"
                style={{
                    overflow: "auto",
                    overflowY: "scroll",
                    width: this.props.width,
                    height: this.props.height,
                    backgroundColor: this.props.backgroundColor,
                }}
                ref={(el) => { this.messageContainer = el; }}
            >
                <div className="message-list">
                    {this.props.messages.map((message, index) => (
                        <div key={index}>
                            {message}
                        </div>
                    ))}
                    <div
                        style={{ float:"left", clear: "both" }}
                        ref={(el) => { this.messagesEnd = el; }}
                    />
                </div>
            </div>
        )
    }
}

export default MessageCard;