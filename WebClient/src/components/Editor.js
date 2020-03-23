import ListErrors from './ListErrors';
import React from 'react';
import agent from '../agent';
import { connect } from 'react-redux';
import {
    ADD_TAG,
    EDITOR_PAGE_LOADED,
    REMOVE_TAG,
    ARTICLE_SUBMITTED,
    EDITOR_PAGE_UNLOADED,
    UPDATE_FIELD_EDITOR
} from '../constants/actionTypes';
import { Container, TextField, Button, Grid, FormGroup, FormControl, FormLabel, Chip, withStyles, Typography, FormControlLabel, Radio, Collapse, RadioGroup } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import PersonIcon from '@material-ui/icons/Person';

const TYPE = require('../constants/spaceTypes').default;

const mapStateToProps = state => ({
    ...state.editor,
    currentUser: state.common.currentUser
});

const mapDispatchToProps = dispatch => ({
    onAddTag: () =>
        dispatch({ type: ADD_TAG }),
    onLoad: payload =>
        dispatch({ type: EDITOR_PAGE_LOADED, payload }),
    onRemoveTag: tag =>
        dispatch({ type: REMOVE_TAG, tag }),
    onSubmit: payload =>
        dispatch({ type: ARTICLE_SUBMITTED, payload }),
    onUnload: payload =>
        dispatch({ type: EDITOR_PAGE_UNLOADED }),
    onUpdateField: (key, value) =>
        dispatch({ type: UPDATE_FIELD_EDITOR, key, value })
});

class Editor extends React.Component {
    constructor() {
        super();

        this.state = {
            spaces: [],
            selectedSpace: {
                _id: 'yourself',
                type: 'yourself',
                name: 'Space của bạn'
            }
        }

        const updateFieldEvent = key => ev => this.props.onUpdateField(key, ev.target.value);
        this.changeTitle = updateFieldEvent('title');
        this.changeDescription = updateFieldEvent('description');
        this.changeBody = updateFieldEvent('body');
        this.changeTagInput = updateFieldEvent('tagInput');

        this.watchForEnter = ev => {
            if (ev.keyCode === 13) {
                ev.preventDefault();
                this.props.onAddTag();
            }
        };

        this.removeTagHandler = tag => () => {
            this.props.onRemoveTag(tag);
        };

        this.submitForm = ev => {
            ev.preventDefault();
            const article = {
                title: this.props.title,
                description: this.props.description,
                body: this.props.body,
                tagList: this.props.tagList
            };

            const slug = { slug: this.props.articleSlug };
            const promise = this.props.articleSlug ?
                agent.Articles.update(Object.assign(article, slug)) :
                agent.Articles.create(article);

            this.props.onSubmit(promise);
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.match.params.slug !== nextProps.match.params.slug) {
            if (nextProps.match.params.slug) {
                this.props.onUnload();
                return this.props.onLoad(agent.Articles.get(this.props.match.params.slug));
            }
            this.props.onLoad(null);
        }
    }

    componentWillMount() {
        if (this.props.match.params.slug) {
            return this.props.onLoad(agent.Articles.get(this.props.match.params.slug));
        }
        this.props.onLoad(null);

        Promise.all([agent.Spaces.byAuthor(this.props.currentUser.username), agent.Spaces.byFollowed()]).then(payload => {
            let spaces = [{
                _id: 'yourself',
                type: 'yourself',
                name: 'Space của bạn'
            }].concat(payload[0].spaces || []).concat(payload[1].spaces || []);
            this.setState({ spaces, selectedSpace: spaces[0] })
        })
    }

    componentWillUnmount() {
        this.props.onUnload();
    }

    render() {
        const { classes } = this.props;
        const { ...state } = this.state;

        return <>
            <Container maxWidth='md' className={classes.container}>
                <ListErrors errors={this.props.errors}></ListErrors>

                <FormControl component='fieldset' fullWidth margin='normal'>
                    <FormLabel>Tiêu đề</FormLabel>
                    <TextField
                        multiline
                        variant='outlined'
                        fullWidth
                        value={this.props.title}
                        onChange={this.changeTitle}
                    />
                </FormControl>

                <FormControl component='fieldset' fullWidth margin='normal'>
                    <FormLabel>Bài viết này nói về gì?</FormLabel>
                    <TextField
                        multiline
                        variant='outlined'
                        fullWidth
                        value={this.props.description}
                        onChange={this.changeDescription}
                    />
                </FormControl>

                <FormControl component='fieldset' fullWidth margin='normal'>
                    <FormLabel>Nội dung</FormLabel>
                    <FormLabel>Note: bạn có thể viết dưới dạng markdown</FormLabel>
                    <TextField
                        multiline
                        variant='outlined'
                        fullWidth
                        value={this.props.body}
                        onChange={this.changeBody}
                    />
                </FormControl>

                <FormControl component='fieldset' fullWidth margin='normal'>
                    <FormLabel>Thẻ tags</FormLabel>
                    <TextField
                        variant='outlined'
                        fullWidth
                        value={this.props.tagInput}
                        onChange={this.changeTagInput}
                        onKeyUp={this.watchForEnter}
                    />

                    <div className="tag-list">
                        {
                            (this.props.tagList || []).map(tag => {
                                return <Chip color='primary'
                                    key={tag}
                                    label={tag}
                                    onDelete={this.removeTagHandler(tag)}
                                    className={classes.chip}
                                />
                            })
                        }
                    </div>
                </FormControl>

                <FormControl component='fieldset' fullWidth margin='normal'>
                    <FormLabel><Typography color='primary'></Typography></FormLabel>
                    <FormLabel>Bạn đang viết vào <Typography color='primary' display='inline'></Typography> nào</FormLabel>

                    <Grid container wrap='nowrap'
                        className={classes.spaceTypeCollapse}
                        onClick={() => this.setState({ isOpenSpaceType: !state.isOpenSpaceType })}
                    >
                        <Grid item container alignItems='center'>
                            {(function () {
                                let selected = TYPE.filter(e => e.type === state.selectedSpace.type);
                                let Icon = (selected[0] || {}).icon || PersonIcon;
                                return <><Icon color='primary' />&nbsp;{state.selectedSpace.name}</>
                            }).call()}
                        </Grid>
                        <Grid item>
                            <Grid container alignItems='center'>
                                <KeyboardArrowDownIcon color='primary' />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Collapse in={state.isOpenSpaceType}>
                        <RadioGroup aria-label="type" onChange={this.changeType} value={state.type}>
                            {state.spaces.map(e => {
                                let template = TYPE.filter(el => el.type === e.type);
                                let Icon = (template[0] || {}).icon || PersonIcon;
                                return <FormControlLabel key={e.type}
                                    value={e.type}
                                    control={<Radio color='primary' />}
                                    label={<Grid container>
                                        <Icon color='primary' />
                                        &nbsp;{e.name}
                                    </Grid>}
                                />
                            })}
                        </RadioGroup>
                    </Collapse>

                </FormControl>
            </Container>
            <Container maxWidth='md' className={classes.groupBtn}>
                <Grid container justify='flex-end'>
                    <Button
                        variant='contained'
                        color='primary'
                        type="button"
                        size='large'
                        disabled={this.props.inProgress}
                        onClick={this.submitForm}
                    >
                        Đăng bài viết
                        </Button>
                </Grid>
            </Container>
        </>
    }
}

const styles = () => ({
    container: {
        backgroundColor: '#FFF'
    },
    chip: {
        marginTop: 10,
        marginRight: 10
    },
    groupBtn: {
        paddingTop: 10,
        paddingBottom: 10,
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#FFF'
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Editor));
