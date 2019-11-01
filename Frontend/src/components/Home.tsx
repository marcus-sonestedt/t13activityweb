import React, { Component } from "react";

class HomeProps {
    loginToken:string = "";
}

class HomeState {

}

export class Home extends Component<HomeProps, HomeState>
{
    render = () => {
        return  <div>{this.props.loginToken}</div>;
    }
}

export default Home;
