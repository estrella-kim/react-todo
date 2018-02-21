import React from 'react';
import ReactDOM from 'react-dom';
import '../stylesheets/todo.css';
import { Button, EditInput } from '../components/index';
import axios from 'axios';
const $http = axios;

export class Todo extends React.Component{
    constructor () {
        super();
        this.lists = [];
        this.filterType = 'all';
        this.state = {
            text : '',
            lists : this.lists
        }
    }
    componentDidMount () {
        let getLists = () => {
            let _this = this;
            $http.get('http://localhost:8000/todo')
                .then(function (res) {
                    res.data.forEach(function (value, index) {
                        const list = {
                            index : value.index,
                            text : value.todo,
                            status : value.isDone
                        }
                        _this.lists.push(list);
                    })
                    _this.setState({
                        lists : _this.lists
                    })
                })
        }
        getLists();
    }
    registerList (e) {
        if(e) {
            e.preventDefault();
        }
        this.lists.push(this.state.text);
        if(this.filterType !== 'done') {
            this.setState({
                lists : this.lists,
                text : ''
            })
        }

        $http.post('http://localhost:8000/todo', this.lists)
            .then(function(res){
                console.log(res);
            })
    }
    filterLists (e) {
        const filter = e.target;
        console.log(filter);
        const arr = [];
        this.filterType = filter;
        this.setState({
            lists : this.lists
        })
        if(this.filterType === 'todo'){
            this.lists.forEach(function(value, index){
                if(value.status === 0) {
                    arr.push(value);
                }
            })
            this.setState({
                lists : arr
            })
        }else if(this.filterType === 'done') {
            this.lists.forEach(function(value, index){
                if(value.status === 1) {
                    arr.push(value);
                }
            })
            this.setState({
                lists : arr
            })
        }
    }
    getText (e) {
        const text = e.target.value;
        this.setState({
            text : text
        })
    }
    changeStatus (list, index) {
        let arr = this.state.lists;
        list.status = list.status === 1 ? 0 : 1;
        arr[index].status = list.status;
        this.setState({
            lists : arr
        })
        $http.put('http://localhost:8000/todo', { status : list.status, index : list.index } )
            .then(function(res){
                console.log(res);
            })
    }

    delete (list) {
        delete this.lists[list.index - 1];
        this.setState({
            lists : this.lists
        })
        $http.delete('http://localhost:8000/todo', {params: {index: list.index}})
            .then(function(res){
                console.log(res);
            })
    }
    edit(index) {
        this.lists[index].editValue = true;
        console.log(this.lists[index]);
        this.setState({
            lists : this.lists
        })
    }
    editText(event, index, list) {
        this.lists[index].text = event.target.value;
        this.setState({
            lists : this.lists
        })
    }
    registerEdited(event, list) {
        event.preventDefault();
        $http.put('http://localhost:8000/todo', { index : list.index, text : list.text })
            .then(function(res){
                console.log(res);
            })
    }
    render () {
        return (
            <div>
                <div className="write-list">
                    <form onSubmit={(e) => this.registerList(e)}>
                        <input type="text" onChange={(e) => this.getText(e) } value={this.state.text}/>
                        <Button buttonText="입력" onClick={ e => this.registerList(e) }/>
                    </form>
                </div>
                <ul className="filter-wrap">
                    <li><label><input type="radio" name="todo-list" value={this.filterType} onChange={(e) => this.filterLists(e)}/>all</label></li>
                    <li><label><input type="radio" name="todo-list" value={this.filterType} onChange={(e) => this.filterLists(e)}/>todo</label></li>
                    <li><label><input type="radio" name="todo-list" value={this.filterType} onChange={(e) => this.filterLists(e)}/>done</label></li>
                </ul>
                <div className="lists-wrap">
                    <ul>
                        { this.state.lists.map((v, i) => (
                            <li key={i}>
                                <input type="checkbox" checked={v.status} onChange={ () => this.changeStatus(v, i) } />
                                { v.editValue ? (<form onSubmit={(e) => this.registerEdited(e, v)}><EditInput value={v.text} onChange={(e) => this.editText(e, i, v)} /></form>)
                                    : (<span>{v.index}{v.text}</span>) }
                                <Button buttonText="삭제" onClick={ () => this.delete(v)}/><Button buttonText="수정" onClick={ () => this.edit(i) }/>
                            </li>)
                        )}
                    </ul>
                </div>
            </div>
        )
    }
}
ReactDOM.render(<Todo/>, document.getElementById('todo'));

