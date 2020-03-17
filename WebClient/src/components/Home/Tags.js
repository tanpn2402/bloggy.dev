import React from 'react';
import agent from '../../agent';
import { Typography } from '@material-ui/core';

const Tags = props => {
    const tags = props.tags;
    if (tags) {
        return (
            <div className="tag-list">
                {
                    tags.map(tag => {
                        const handleClick = ev => {
                            ev.preventDefault();
                            props.onClickTag(tag, agent.Articles.byTag(tag));
                        };

                        return (
                            <a
                                href=""
                                className="tag-default tag-pill"
                                key={tag}
                                onClick={handleClick}>
                                {tag}
                            </a>
                        );
                    })
                }
            </div>
        );
    } else {
        return (
            <div>Đang tải <Typography color='primary' display='inline'>#</Typography>...</div>
        );
    }
};

export default Tags;
