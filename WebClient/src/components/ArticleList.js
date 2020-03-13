import ArticlePreview from './ArticlePreview';
import ListPagination from './ListPagination';
import React from 'react';
import { Typography } from '@material-ui/core';

const ArticleList = props => {
    if (!props.articles) {
        return (
            <div className="article-preview">Loading...</div>
        );
    }

    if (props.articles.length === 0) {
        return (
            <div className="article-preview">
                <p>Hiện tại chưa có bài viết nào ở  <Typography color='primary' display='inline' component='strong'>Space</Typography>  này</p>
            </div>
        );
    }

    return (
        <div>
            {
                props.articles.map(article => {
                    return (
                        <ArticlePreview article={article} key={article.slug} />
                    );
                })
            }

            <ListPagination
                pager={props.pager}
                articlesCount={props.articlesCount}
                currentPage={props.currentPage} />
        </div>
    );
};

export default ArticleList;
