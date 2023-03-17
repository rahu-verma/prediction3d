import React, { Component } from "react";
import {
    BrowserRouter as Router,
    Link,
    Route,
    Routes,
    Navigate,
} from "react-router-dom";
import "./App.css";
import { Uploader } from "uploader";
import { UploadButton } from "react-uploader";
import { axios } from "axios";
import DayPicker from "./components/daypicker.js";
import MonthPicker from "./components/monthpicker.js";
import Button from "@material-ui/core/Button";

class Upload extends Component {
    constructor(props) {
        super(props);
        var radios = [
            { value: "gam_type", label: "GAM data" },
            { value: "pubg_type", label: "PUBG data" },
            { value: "net60_type", label: "Lockerdome data" },
            { value: "prebid_type", label: "Prebid data" },
            { value: "hmadx1_type", label: "HM Adx 1 data" },
            { value: "hmadx2_type", label: "HM Adx 2 data" },
        ];

        var deploy = [
            { value: "client", label: "1. Client Sync", limit: 20 },
            { value: "admin", label: "2. Admin Sync", limit: 15 },
            { value: "chart", label: "3. Chart Sync", limit: 5 },
            { value: "report", label: "4. Report Sync", limit: 15 },
            { value: "breakdown", label: "5. Breakdown Sync", limit: 15 },
        ];

        var adminRadios = [
            { value: "unfilled_type", label: "Unfilled Report Type" },
            { value: "house_ads_type", label: "House Ad Report Type" },
        ];

        this.state = {
            apiResponse: "",
            csrfToken: "",
            radios: radios,
            deploy: deploy,
            adminRadios: adminRadios,
            apiKeyUploader: "public_W142hSi4NdibL5oVTNvDrPiLK4R3",
        };

        this.getCSRFToken();
    }

    callAPI() {
        fetch("/test")
            .then((res) => res.text())
            .then((res) => this.setState({ apiResponse: res }));
    }

    async getCSRFToken() {
        const csrfToken = await fetch("/getCSRFToken")
            .then((res) => res.text())
            .then((res) => {
                let csrfToken = JSON.parse(res).CSRFToken;
                return csrfToken;
            });

        this.state.csrfToken = csrfToken;
    }

    async checkAuth() {
        await fetch("/checkToken")
            .then((res) => {
                if (res.status === 200) {
                    this.setState({ loading: false });
                } else {
                    const error = new Error(res.error);
                    throw error;
                }
            })
            .catch((err) => {
                console.error(err);
                this.setState({ loading: false, redirect: true });
            });
    }

    componentWillMount() {
        this.checkAuth();

        const { loading, redirect } = this.state;
        if (!loading && !redirect) {
            this.callAPI();
        }
    }

    render() {
        const { loading, redirect } = this.state;
        if (loading) {
            return null;
        }
        if (redirect) {
            return <Navigate to="/login" />;
        }

        const uploader = new Uploader({ apiKey: this.state.apiKeyUploader });
        const exampleInput = React.createRef();
        const adminInput = React.createRef();

        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Welcome to Hooliganmedia</h1>
                    <h3>Data Uploader Platform</h3>
                    <p>Upoad reports below</p>
                    <form method="POST" action="/upload">
                        <UploadButton
                            uploader={uploader}
                            options={{ multi: true }}
                            onComplete={(files) =>
                                (exampleInput.current.value = files[0].fileUrl)
                            }
                        >
                            {({ onClick }) => (
                                <button onClick={onClick}>
                                    Upload a file...
                                </button>
                            )}
                        </UploadButton>
                        <input
                            type="hidden"
                            name="hm_file_url"
                            value=""
                            ref={exampleInput}
                        />
                        <DayPicker />
                        {this.state.radios.map((item) => (
                            <p>
                                <label>
                                    <input
                                        name={item.value}
                                        type="checkbox"
                                        value="1"
                                    />
                                    {item.label}
                                </label>
                            </p>
                        ))}
                        <p>
                            <input
                                type="hidden"
                                name="_csrf"
                                value={this.state.csrfToken}
                            />
                            <Button type="submit" variant="contained">
                                Upload
                            </Button>
                        </p>
                    </form>
                    <form method="POST" action="/revcontent">
                        <p>
                            Manually Sync Revcontent, then wait for 60 minutes
                            before any other task
                        </p>
                        <DayPicker />
                        <p>
                            <input
                                type="hidden"
                                name="_csrf"
                                value={this.state.csrfToken}
                            />
                            <Button type="submit" variant="contained">
                                Sync Now
                            </Button>
                        </p>
                    </form>
                    <form method="POST" action="/admin-reports">
                        <p>Upload Admin Reports of House Ads & Unfilled data</p>
                        <UploadButton
                            uploader={uploader}
                            options={{ multi: true }}
                            onComplete={(files) =>
                                (adminInput.current.value = files[0].fileUrl)
                            }
                        >
                            {({ onClick }) => (
                                <button onClick={onClick}>
                                    Upload a file...
                                </button>
                            )}
                        </UploadButton>
                        <input
                            type="hidden"
                            name="hm_admin_file_url"
                            value=""
                            ref={adminInput}
                        />
                        <DayPicker />
                        {this.state.adminRadios.map((item) => (
                            <p>
                                <label>
                                    <input
                                        name={item.value}
                                        type="checkbox"
                                        value="1"
                                    />
                                    {item.label}
                                </label>
                            </p>
                        ))}
                        <p>
                            <input
                                type="hidden"
                                name="_csrf"
                                value={this.state.csrfToken}
                            />
                            <Button type="submit" variant="contained">
                                Upload Now
                            </Button>
                        </p>
                    </form>
                    <form method="POST" action="/deploy">
                        <p>
                            Deploy data one by one for a specific day, Do this
                            for everyday after all your reports are upoloaded.
                        </p>
                        <p>
                        <a href="http://134.122.62.133/deploymentStatus" target="_blank">Check current deployment status</a>
                        </p>
                        Start : <MonthPicker />
                        End : <MonthPicker />
                        <p>
                            <input
                                type="hidden"
                                name="_csrf"
                                value={this.state.csrfToken}
                            />
                            {this.state.deploy.map((item) => (
                                <p>
                                    <label>
                                        <input
                                            name={item.value}
                                            type="checkbox"
                                            value="1"
                                        />
                                        <Button
                                            type="submit"
                                            variant="contained"
                                        >
                                            {item.label}
                                        </Button>
                                    </label>
                                    <small>
                                        {" Approximate Waiting " + item.limit + " Minutes"}
                                        {item.value != "breakdown"
                                            ? ", Check Status, Then do next deploy after completion of previous."
                                            : ""}
                                    </small>
                                </p>
                            ))}
                        </p>
                    </form>
                </header>
                <p className="App-intro" stye={{ textAlign: "center" }}>
                    {this.state.apiResponse}
                </p>
            </div>
        );
    }
}

export default Upload;
