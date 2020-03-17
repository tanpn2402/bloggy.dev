import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import { Container, TextField, Button, Grid, FormGroup, FormControl, FormLabel, Chip, withStyles, Typography, Divider, Radio, RadioGroup, FormControlLabel, Icon, Collapse } from '@material-ui/core';
import classNames from 'classnames';
import ListErrors from '../ListErrors';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import LockIcon from '@material-ui/icons/Lock';
import WorkIcon from '@material-ui/icons/Work';
import SchoolIcon from '@material-ui/icons/School';
import CodeIcon from '@material-ui/icons/Code';
import ForumIcon from '@material-ui/icons/Forum';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import MovieIcon from '@material-ui/icons/Movie';
import MenuBookIcon from '@material-ui/icons/MenuBook';

const Promise = global.Promise;

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
    onSubmit: (payload, callback) => dispatch({ payload, callback }),
});

const TYPE = [
    { type: 'work', icon: WorkIcon, label: 'Công việc' },
    { type: 'school', icon: SchoolIcon, label: 'Trường/Lớp' },
    { type: 'code', icon: CodeIcon, label: 'Lập trình' },
    { type: 'music', icon: MusicNoteIcon, label: 'Âm nhạc' },
    { type: 'movie', icon: MovieIcon, label: 'Phim ảnh' },
    { type: 'book', icon: MenuBookIcon, label: 'Sách truyện' },
    { type: 'forum', icon: ForumIcon, label: 'Thảo luận' },
    { type: 'other', icon: AspectRatioIcon, label: 'Khác' },
]

class NewSpace extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            type: 'other',
            visibility: 'public'
        }

        const updateFieldEvent = key => ev => {
            this.setState({
                [key]: ev.target.value
            })
        };

        this.changeName = updateFieldEvent('name');
        this.changeDescription = updateFieldEvent('description');
        this.changeType = updateFieldEvent('type');
        this.changeVisibility = updateFieldEvent('visibility');

        this.submitForm = ev => {
            ev.preventDefault();

            const space = {
                name: this.state.name,
                description: this.state.description,
                type: this.state.type,
                visibility: this.state.visibility
            };

            const promise = agent.Spaces.create(space);
            this.props.onSubmit(promise, ({ payload }) => {
                console.log(payload)
            });
        };
    }

    componentWillMount() {

    }

    componentWillUnmount() {
        // this.props.onUnload();
    }

    render() {
        const { classes } = this.props;
        const { ...state } = this.state;

        return <>
            <Container maxWidth='md' className={classes.container}>
                <Typography variant='h5' color='primary'>Tạo&nbsp;&nbsp;<strong>Space</strong></Typography>
                <br />
                <ListErrors errors={this.props.errors}></ListErrors>

                <Divider />
                <FormControl component='fieldset' fullWidth margin='normal'>
                    <FormLabel>Tên Space</FormLabel>
                    <TextField
                        multiline
                        variant='outlined'
                        fullWidth
                        value={state.name}
                        onChange={this.changeName}
                    />
                </FormControl>

                <FormControl component='fieldset' fullWidth margin='normal'>
                    <FormLabel>Mô tả ngắn gọn về Space</FormLabel>
                    <FormLabel>Note: bạn có thể viết dưới dạng markdown</FormLabel>
                    <TextField
                        multiline
                        variant='outlined'
                        fullWidth
                        value={state.description}
                        onChange={this.changeDescription}
                    />
                </FormControl>
                <br />
                <br />

                <Divider />

                <FormControl component="fieldset" fullWidth margin='normal'>
                    <RadioGroup aria-label="visibility" onChange={this.changeVisibility} value={state.visibility}>
                        <FormControlLabel value="public" control={<Radio color='primary' />} label={<div>
                            <Grid container><PeopleAltIcon color='primary' />&nbsp;Công khai</Grid>
                            <small>&nbsp;&nbsp;Bất ai đều có thể xem các bài đăng, nội dung của  &nbsp;
                                <Typography color='primary' display='inline'>Space</Typography></small>
                        </div>} />

                        <FormControlLabel value="private" control={<Radio color='primary' />} label={<div>
                            <Grid container><LockIcon color='primary' />&nbsp;Mình tôi</Grid>
                            <small>&nbsp;&nbsp;Chỉ mình bạn có thể xem được các bài đăng, nội dung của &nbsp;
                                <Typography color='primary' display='inline'>Space</Typography></small>
                        </div>} />
                    </RadioGroup>
                </FormControl>

                <Divider />

                <FormControl component="fieldset" fullWidth margin='normal'>
                    <Grid container wrap='nowrap'
                        className={classes.spaceTypeCollapse}
                        onClick={() => this.setState({ isOpenSpaceType: !state.isOpenSpaceType })}
                    >
                        <Grid item container alignItems='center'>
                            {(function () {
                                let selected = TYPE.filter(e => e.type === state.type);
                                let Icon = selected[0].icon;
                                return <><Icon color='primary' />&nbsp;{selected[0].label}</>
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
                            {TYPE.map(e => {
                                let Icon = e.icon;
                                return <FormControlLabel key={e.type}
                                    value={e.type}
                                    control={<Radio color='primary' />}
                                    label={<Grid container>
                                        <Icon color='primary' />
                                        &nbsp;{e.label}
                                    </Grid>}
                                />
                            })}
                        </RadioGroup>
                    </Collapse>


                </FormControl>

                <Divider />

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
                        Tạo&nbsp;<strong>Space</strong>
                    </Button>
                </Grid>
            </Container>
        </>
    }
}

const styles = theme => ({
    container: {
        paddingTop: 10,
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
    },
    spaceTypeCollapse: {
        borderRadius: 8,
        border: '1px solid ' + theme.palette.primary.main,
        cursor: 'pointer',
        padding: 10
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(NewSpace));
