import LockIcon from '@material-ui/icons/Lock';
import WorkIcon from '@material-ui/icons/Work';
import SchoolIcon from '@material-ui/icons/School';
import ForumIcon from '@material-ui/icons/Forum';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import MovieIcon from '@material-ui/icons/Movie';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import CodeIcon from '@material-ui/icons/Code';

export default [
    { type: 'work', icon: WorkIcon, label: 'Công việc' },
    { type: 'school', icon: SchoolIcon, label: 'Trường/Lớp' },
    { type: 'code', icon: CodeIcon, label: 'Lập trình' },
    { type: 'music', icon: MusicNoteIcon, label: 'Âm nhạc' },
    { type: 'movie', icon: MovieIcon, label: 'Phim ảnh' },
    { type: 'book', icon: MenuBookIcon, label: 'Sách truyện' },
    { type: 'forum', icon: ForumIcon, label: 'Thảo luận' },
    { type: 'other', icon: AspectRatioIcon, label: 'Khác' },
]