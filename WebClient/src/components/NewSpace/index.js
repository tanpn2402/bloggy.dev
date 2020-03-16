import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import { Container, TextField, Button, Grid, FormGroup, FormControl, FormLabel, Chip, withStyles, Typography, Divider, Radio, RadioGroup, FormControlLabel, Icon } from '@material-ui/core';
import classNames from 'classnames';
import ListErrors from '../ListErrors';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import LockIcon from '@material-ui/icons/Lock';
import WorkIcon from '@material-ui/icons/Work';
import SchoolIcon from '@material-ui/icons/School';
import CodeIcon from '@material-ui/icons/Code';
import ForumIcon from '@material-ui/icons/Forum';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';

const Promise = global.Promise;

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
    onSubmit: (payload, callback) => dispatch({ payload, callback }),
});

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
                        value={this.state.name}
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
                        value={this.state.description}
                        onChange={this.changeDescription}
                    />
                </FormControl>
                <br />
                <br />

                <Divider />

                <FormControl component="fieldset" fullWidth margin='normal'>
                    <RadioGroup aria-label="visibility" onChange={this.changeVisibility} value={this.state.visibility}>
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

                <Divider />

                <FormControl component="fieldset" fullWidth margin='normal'>
                    <RadioGroup aria-label="type" onChange={this.changeType} value={this.state.type}
                        style={{ flexDirection: 'row' }}>
                        <FormControlLabel value="work" control={<Radio color='primary' />} label={<Grid container>
                            <WorkIcon color='primary' />
                            &nbsp;Công việc
                        </Grid>} />
                        <FormControlLabel value="school" control={<Radio color='primary' />} label={<Grid container>
                            <SchoolIcon color='primary' />
                            &nbsp;Trường/Lớp
                        </Grid>} />
                        <FormControlLabel value="code" control={<Radio color='primary' />} label={<Grid container>
                            <CodeIcon color='primary' />
                            &nbsp;Lập trình
                        </Grid>} />
                        <FormControlLabel value="forum" control={<Radio color='primary' />} label={<Grid container>
                            <ForumIcon color='primary' />
                            &nbsp;Thảo luận
                        </Grid>} />
                        <FormControlLabel value="other" control={<Radio color='primary' />} label={<Grid container>
                            <AspectRatioIcon color='primary' />
                            &nbsp;Khác
                        </Grid>} />
                    </RadioGroup>
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
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(NewSpace));
