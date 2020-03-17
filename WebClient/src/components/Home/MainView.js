import ArticleList from '../ArticleList';
import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';

const YourFeedTab = props => {
    if (props.token) {
        const clickHandler = ev => {
            ev.preventDefault();
            props.onTabClick('feed', agent.Articles.feed());
        }

        return (
            <li className="nav-item">
                <a href=""
                    className={props.tab === 'feed' ? 'nav-link active' : 'nav-link'}
                    onClick={clickHandler}>
                    Tin của bạn
                </a>
            </li>
        );
    }
    return null;
};

const GlobalFeedTab = props => {
    const clickHandler = ev => {
        ev.preventDefault();
        props.onTabClick('all', agent.Articles.all());
    };
    return (
        <li className="nav-item">
            <a
                href=""
                className={props.tab === 'all' ? 'nav-link active' : 'nav-link'}
                onClick={clickHandler}>
                Tổng hợp
            </a>
        </li>
    );
};

const TagFilterTab = props => {
    if (!props.tag) {
        return null;
    }

    return (
        <li className="nav-item">
            <a href="" className="nav-link active">
                Thẻ&nbsp;&nbsp;<i className="ion-pound"></i>{props.tag}
            </a>
        </li>
    );
};

const SpaceFilterTab = props => {
    if (!props.space) {
        return null;
    }

    return (
        <li className="nav-item">
            <a href="" className="nav-link active">
                &nbsp;&nbsp;<i className="ion-pound"></i>{props.space}
            </a>
        </li>
    );
};

const mapStateToProps = state => ({
    token: state.common.token
});

const MainView = props => {
    return (
        <div>
            <div className="feed-toggle">
                <ul className="nav nav-pills outline-active">

                    <YourFeedTab
                        token={props.token}
                        tab={props.tab}
                        onTabClick={props.onTabClick}
                    />

                    <GlobalFeedTab tab={props.tab} onTabClick={props.onTabClick} />

                    <TagFilterTab tag={props.tag} />

                    <SpaceFilterTab space={props.space} />

                </ul>
            </div>

            <ArticleList
                articles={props.articles}
                loading={props.loading}
            />
        </div>
    );
};

export default connect(mapStateToProps)(MainView);
