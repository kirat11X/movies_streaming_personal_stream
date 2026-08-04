import { useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import PageHeader from '../ui/PageHeader';
import Icon from '../ui/Icon';
import './SuggestMovie.css';

/** Lets any signed-in viewer pitch a title for the curator to consider adding. */
const SuggestMovie = () => {
    const axiosPrivate = useAxiosPrivate();

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await axiosPrivate.post('/suggestions', { title: title.trim(), message: message.trim() });
            setSent(true);
            setTitle('');
            setMessage('');
        } catch (err) {
            setError(err.response?.data?.error || 'Could not send your suggestion. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page page--offset">
            <div className="shell suggest-shell">
                <PageHeader
                    eyebrow="Have a request?"
                    icon="message"
                    title="Suggest a title"
                    description="Tell the curator what you'd like to see added — a title, a franchise, anything you're missing here."
                />

                {sent && (
                    <div className="notice notice--info" role="status">
                        <Icon name="check" size={16} />
                        <span>Thanks — your suggestion was sent to the curator.</span>
                    </div>
                )}
                {error && (
                    <div className="notice notice--error" role="alert">
                        <Icon name="alert" size={16} /> <span>{error}</span>
                    </div>
                )}

                <form className="suggest-form" onSubmit={submit}>
                    <div className="field">
                        <label className="field__label" htmlFor="suggest-title">Title</label>
                        <input
                            id="suggest-title"
                            className="input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Spirited Away"
                            minLength={1}
                            maxLength={200}
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="suggest-message">Why should it be added? (optional)</label>
                        <textarea
                            id="suggest-message"
                            className="input"
                            rows={4}
                            maxLength={2000}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="A note for the curator…"
                        />
                    </div>

                    <button type="submit" className="btn btn--primary btn--lg" disabled={submitting || !title.trim()}>
                        <Icon name="message" size={17} /> {submitting ? 'Sending…' : 'Send suggestion'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SuggestMovie;
