import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import { Container, TextField, Button, Grid, FormGroup, FormControl, FormLabel, Chip, withStyles, Typography, Divider, Radio, RadioGroup, FormControlLabel, Icon, Collapse, IconButton } from '@material-ui/core';
import classNames from 'classnames';
import ListErrors from '../ListErrors';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import LockIcon from '@material-ui/icons/Lock';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import InsertPhotoOutlinedIcon from '@material-ui/icons/InsertPhotoOutlined';

const Promise = global.Promise;

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
    onSubmit: (payload, callback) => dispatch({ payload, callback }),
});

const TYPE = require('../../constants/spaceTypes').default;

class NewSpace extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            errors: {}
        }

        this.submitForm = async () => {
            let uploadRlt = await this.uploadCover.onUpload();
            if (uploadRlt.success) {
                let photoPath = (uploadRlt.data[0] || {}).filePath || '';

                let res = await this.editSpace.onCreateSpace({
                    cover_photo: photoPath
                })

                if (res.success) {
                    if (res.data.code === 200) {
                        props.history.replace('/?space=' + res.data.spaces._id);
                    } else {
                        this.setState({
                            errors: {
                                "Lỗi": "Không thể tạo Space"
                            }
                        })
                    }
                } else {
                    this.setState({
                        errors: res.data
                    })
                }
            } else {
                this.setState({
                    errors: uploadRlt.data
                })
            }
        }
    }

    render() {
        const { classes, ...props } = this.props;

        return <>
            <Container maxWidth='lg' className={classes.container}>
                <Typography variant='h5' color='primary'>Tạo&nbsp;&nbsp;<strong>Space</strong></Typography>
                <br />

                <ListErrors errors={this.state.errors}></ListErrors>

                <Divider />

                <Grid container spacing={4}>
                    <Grid item xs sm={8} md={9}>
                        <Typography variant='h6' color='primary'>Thông tin </Typography>

                        <EditSpaceInfo classes={classes}
                            innerRef={e => this.editSpace = e}
                            onSubmit={props.onSubmit}
                        />
                    </Grid>

                    <Grid item xs sm={4} md={3}>
                        <Typography variant='h6' color='primary'>Metadata</Typography>

                        <UploadSpaceCover classes={classes} innerRef={e => this.uploadCover = e} />

                    </Grid>
                </Grid>
                <Divider />
            </Container>
            <Container maxWidth='lg' className={classes.groupBtn}>
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



class EditSpaceInfo extends React.Component {

    constructor(props) {
        super(props);
        props.innerRef(this);

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

        this.onCreateSpace = (p = {}) => {
            const space = {
                name: this.state.name || '',
                description: this.state.description || '',
                type: this.state.type,
                visibility: this.state.visibility,
                cover_photo: p.cover_photo
            };

            return new Promise((resolve => {
                let errors = {};
                if (space.name.trim() === '') {
                    errors['Tên Space'] = 'Không để để trống';
                }

                if (Object.keys(errors).length > 0) {
                    return resolve({ success: false, data: errors })
                }

                props.onSubmit(agent.Spaces.create(space), ({ payload }) => {
                    resolve({ success: true, data: payload })
                });
            }))
        };
    }

    render() {
        const { classes } = this.props;
        const { ...state } = this.state;

        return <>
            <FormControl component='fieldset' fullWidth margin='normal'>
                <FormLabel><Typography color='primary'># Tên Space</Typography></FormLabel>
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
        </>
    }
}


class UploadSpaceCover extends React.Component {
    constructor(props) {
        super(props);
        props.innerRef(this);

        this.state = {
            isHasPhoto: false,
            photoBuffer: null,
            fileName: ''
        }
    }

    render() {
        const { classes } = this.props;
        const { ...state } = this.state;

        return <>
            <FormControl component='fieldset' fullWidth margin='normal'>
                <FormLabel><Typography color='primary'># Ảnh bìa</Typography></FormLabel>
                <IconButton onClick={() => this.onOpenFileDialog()}>
                    {state.isHasPhoto && <img ref='coverPhoto' className={classes.coverPhoto} />}
                    {!state.isHasPhoto && <InsertPhotoOutlinedIcon className={classes.insertCoverPhoto} />}

                    <input key={new Date().getTime()}
                        type='file'
                        id="coverPhoto"
                        onChange={e => this.onfileChange(e)}
                        style={{ display: 'none' }}
                    />
                </IconButton>
            </FormControl>
        </>
    }

    onOpenFileDialog = () => {
        document.getElementById('coverPhoto').click();
    }

    onfileChange = async (e) => {
        const self = this;
        let file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = async function (e) {
                let buf = new Uint8Array(e.target.result);

                self.setState({
                    photoBuffer: buf,
                    fileName: file.name
                })
            }

            reader.readAsArrayBuffer(file);


            // view image
            let data = await (new Promise(resolve => {
                var b64Reader = new FileReader();
                b64Reader.onload = function () {
                    resolve(b64Reader.result);
                };

                b64Reader.readAsDataURL(file);
            }));

            self.setState({
                isHasPhoto: true
            }, () => {
                self.refs.coverPhoto.src = data;
            })
        }
    }

    onUpload = (p = {}) => {
        const self = this;

        return new Promise((resolve => {
            var fd = new FormData();
            fd.append('fname', this.state.fileName);
            fd.append('stream', new Blob([this.state.photoBuffer]));

            var xhr = new XMLHttpRequest();
            xhr.open("POST", '/assets/space/upload/cover', true);

            xhr.upload.onprogress = function (e) {
                let percent = Math.ceil((e.loaded / e.total) * 100);

                self.setState({
                    uploadProgress: percent
                });
            }

            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    // let statusCode = this.status;
                    let response = this.response;

                    try {
                        let resp = JSON.parse(response);
                        resolve({ success: true, data: resp });

                        // if (resp && resp.code === 200 && resp.filePath && resp.filePath.length > 0) {
                        //     self.setState({

                        //     })
                        // }
                    } catch (err) {
                        resolve({ success: false, data: err });
                    }
                }
            }

            xhr.send(fd);

        }));
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
    },
    insertCoverPhoto: {
        width: '100%',
        height: '100%'
    },
    coverPhoto: {
        width: '100%',
        borderRadius: 8
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(NewSpace));
