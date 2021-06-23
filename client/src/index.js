import React from "react";
import { render } from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import App from "./components/App";
import Blocks from "./components/Blocks";
import "./index.css"; // equipped CSS

render(
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={App} />
            <Route exact path="/blocks" component={Blocks} />
        </Switch>
    </BrowserRouter>,
    document.getElementById("root")
);