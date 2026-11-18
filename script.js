// ======================================================
// LANDSLIDE WARNING SYSTEM - MAIN SCRIPT
// ======================================================

let predictionChart = null;
let riskChart = null;

const API_BASE_URL = "http://127.0.0.1:5000";

// ======================================================
// LOCATION ELEMENTS
// ======================================================

const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const locationStatus = document.getElementById("locationStatus");

const locationButton =
    document.getElementById("useLocationBtn") ||
    document.getElementById("getLocationBtn") ||
    document.getElementById("locationBtn");

// ======================================================
// USE CURRENT LOCATION
// ======================================================

if (locationButton) {

    locationButton.addEventListener("click", function () {

        if (!navigator.geolocation) {

            if (locationStatus) {
                locationStatus.textContent =
                    "❌ Geolocation is not supported by your browser.";
                locationStatus.className =
                    "location-status error";
            }

            return;
        }

        if (locationStatus) {
            locationStatus.textContent =
                "📍 Getting your current location...";
            locationStatus.className =
                "location-status loading";
        }

        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                if (latitudeInput) {
                    latitudeInput.value =
                        latitude.toFixed(6);
                }

                if (longitudeInput) {
                    longitudeInput.value =
                        longitude.toFixed(6);
                }

                if (locationStatus) {

                    locationStatus.textContent =
                        "✅ Current location detected successfully.";

                    locationStatus.className =
                        "location-status success";
                }
            },

            function (error) {

                let message =
                    "❌ Unable to get your location.";

                if (error.code === 1) {
                    message =
                        "❌ Location permission was denied. Please allow location access.";
                }

                else if (error.code === 2) {
                    message =
                        "❌ Your location could not be determined.";
                }

                else if (error.code === 3) {
                    message =
                        "❌ Location request timed out.";
                }

                if (locationStatus) {

                    locationStatus.textContent =
                        message;

                    locationStatus.className =
                        "location-status error";
                }
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// ======================================================
// PREDICTION BUTTON
// ======================================================

const predictButton =
    document.getElementById("predictBtn");

if (predictButton) {

    predictButton.addEventListener(
        "click",
        async function () {

            const rainfallElement =
                document.getElementById("rainfall");

            const slopeElement =
                document.getElementById("slope");

            const soilElement =
                document.getElementById("soil");

            const result =
                document.getElementById("result");

            if (!rainfallElement ||
                !slopeElement ||
                !soilElement ||
                !result) {

                console.error(
                    "Required HTML elements not found."
                );

                return;
            }

            const rainfall =
                rainfallElement.value.trim();

            const slope =
                slopeElement.value.trim();

            const soil =
                soilElement.value.trim();

            // ==================================================
            // LOCATION
            // ==================================================

            const latitude =
                latitudeInput
                    ? latitudeInput.value.trim()
                    : "";

            const longitude =
                longitudeInput
                    ? longitudeInput.value.trim()
                    : "";

            // ==================================================
            // CHECK INPUT
            // ==================================================

            if (
                rainfall === "" ||
                slope === "" ||
                soil === ""
            ) {

                result.innerHTML = `
                    <div class="warning-box">
                        ⚠️ Please enter all environmental values.
                    </div>
                `;

                return;
            }

            // ==================================================
            // CONVERT
            // ==================================================

            const rainfallValue =
                Number(rainfall);

            const slopeValue =
                Number(slope);

            const soilValue =
                Number(soil);

            // ==================================================
            // NUMERIC VALIDATION
            // ==================================================

            if (
                !Number.isFinite(rainfallValue) ||
                !Number.isFinite(slopeValue) ||
                !Number.isFinite(soilValue)
            ) {

                result.innerHTML = `
                    <div class="warning-box">
                        ❌ Please enter valid numeric values.
                    </div>
                `;

                return;
            }

            // ==================================================
            // RAINFALL VALIDATION
            // ==================================================

            if (rainfallValue < 0) {

                result.innerHTML = `
                    <div class="warning-box">
                        ❌ Rainfall cannot be negative.
                    </div>
                `;

                return;
            }

            // ==================================================
            // SLOPE VALIDATION
            // ==================================================

            if (
                slopeValue < 0 ||
                slopeValue > 90
            ) {

                result.innerHTML = `
                    <div class="warning-box">
                        ❌ Slope angle must be between 0° and 90°.
                    </div>
                `;

                return;
            }

            // ==================================================
            // SOIL VALIDATION
            // ==================================================

            if (
                soilValue < 0 ||
                soilValue > 100
            ) {

                result.innerHTML = `
                    <div class="warning-box">
                        ❌ Soil saturation must be between 0% and 100%.
                    </div>
                `;

                return;
            }

            // ==================================================
            // LOCATION
            // ==================================================

            let latitudeValue = null;
            let longitudeValue = null;

            if (latitude !== "" || longitude !== "") {

                if (latitude === "" || longitude === "") {

                    result.innerHTML = `
                        <div class="warning-box">
                            ❌ Please enter both latitude and longitude.
                        </div>
                    `;

                    return;
                }

                latitudeValue =
                    Number(latitude);

                longitudeValue =
                    Number(longitude);

                if (
                    !Number.isFinite(latitudeValue) ||
                    !Number.isFinite(longitudeValue)
                ) {

                    result.innerHTML = `
                        <div class="warning-box">
                            ❌ Please enter valid latitude and longitude.
                        </div>
                    `;

                    return;
                }

                if (
                    latitudeValue < -90 ||
                    latitudeValue > 90
                ) {

                    result.innerHTML = `
                        <div class="warning-box">
                            ❌ Latitude must be between -90° and 90°.
                        </div>
                    `;

                    return;
                }

                if (
                    longitudeValue < -180 ||
                    longitudeValue > 180
                ) {

                    result.innerHTML = `
                        <div class="warning-box">
                            ❌ Longitude must be between -180° and 180°.
                        </div>
                    `;

                    return;
                }
            }

            // ==================================================
            // LOADING
            // ==================================================

            result.innerHTML = `
                <div class="loading">
                    🤖 AI is analyzing environmental conditions...
                </div>
            `;

            try {

                console.log(
                    "Sending prediction request to Flask..."
                );

                console.log({
                    Rainfall_mm: rainfallValue,
                    Slope_Angle: slopeValue,
                    Soil_Saturation: soilValue,
                    latitude: latitudeValue,
                    longitude: longitudeValue
                });

                // ==================================================
                // SEND DATA TO FLASK
                // ==================================================

                const response =
                    await fetch(
                        `${API_BASE_URL}/predict`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({

                                Rainfall_mm:
                                    rainfallValue,

                                Slope_Angle:
                                    slopeValue,

                                Soil_Saturation:
                                    soilValue,

                                latitude:
                                    latitudeValue,

                                longitude:
                                    longitudeValue
                            })
                        }
                    );

                console.log(
                    "Flask response status:",
                    response.status
                );

                // ==================================================
                // READ RESPONSE
                // ==================================================

                const text =
                    await response.text();

                let data;

                try {
                    data =
                        JSON.parse(text);
                }

                catch (jsonError) {

                    console.error(
                        "Invalid JSON response:",
                        text
                    );

                    throw new Error(
                        "Flask returned an invalid response."
                    );
                }

                console.log(
                    "Flask response:",
                    data
                );

                // ==================================================
                // BACKEND ERROR
                // ==================================================

                if (!response.ok) {

                    result.innerHTML = `
                        <div class="warning-box">
                            ❌ ${
                                data.error ||
                                data.message ||
                                "Prediction failed"
                            }
                        </div>
                    `;

                    return;
                }

                // ==================================================
                // PROBABILITY
                // ==================================================

                const landslideProbability =
                    Number(
                        data.landslide_probability || 0
                    ).toFixed(2);

                const noLandslideProbability =
                    Number(
                        data.no_landslide_probability || 0
                    ).toFixed(2);

                // ==================================================
                // RISK
                // ==================================================

                const risk =
                    String(
                        data.risk || "LOW"
                    ).toUpperCase();

                // ==================================================
                // RISK MESSAGE
                // ==================================================

                let riskIcon =
                    "✅";

                let warningText =
                    "CONDITIONS APPEAR SAFE";

                if (risk === "HIGH") {

                    riskIcon =
                        "🚨";

                    warningText =
                        "LANDSLIDE WARNING";
                }

                else if (risk === "MEDIUM") {

                    riskIcon =
                        "⚠️";

                    warningText =
                        "CAUTION ADVISED";
                }

                // ==================================================
                // RESULT
                // ==================================================

                result.innerHTML = `

                    <div class="risk-result ${risk.toLowerCase()}">

                        <div class="risk-icon">
                            ${riskIcon}
                        </div>

                        <div class="risk-title">
                            ${risk} RISK
                        </div>

                        <div class="warning-text">
                            ${warningText}
                        </div>

                        <div class="probability-box">

                            <div class="risk-meter">

                                <div class="risk-meter-label">

                                    <span>
                                        Risk Level
                                    </span>

                                    <strong>
                                        ${landslideProbability}%
                                    </strong>

                                </div>

                                <div class="risk-bar">

                                    <div
                                        class="risk-progress"
                                        style="width: ${landslideProbability}%">
                                    </div>

                                </div>

                            </div>

                            <div class="probability-number">
                                ${landslideProbability}%
                            </div>

                            <div class="probability-label">
                                Landslide Probability
                            </div>

                        </div>

                        <div class="safe-probability">

                            No Landslide Probability:

                            <strong>
                                ${noLandslideProbability}%
                            </strong>

                        </div>

                        <div class="input-summary">

                            <div>
                                🌧️
                                <span>Rainfall</span>
                                <strong>
                                    ${rainfallValue} mm
                                </strong>
                            </div>

                            <div>
                                ⛰️
                                <span>Slope</span>
                                <strong>
                                    ${slopeValue}°
                                </strong>
                            </div>

                            <div>
                                💧
                                <span>Soil</span>
                                <strong>
                                    ${soilValue}%
                                </strong>
                            </div>

                        </div>

                        ${
                            latitudeValue !== null &&
                            longitudeValue !== null
                            ? `

                                <div class="input-summary">

                                    <div>
                                        📍
                                        <span>Latitude</span>
                                        <strong>
                                            ${latitudeValue.toFixed(6)}
                                        </strong>
                                    </div>

                                    <div>
                                        🌐
                                        <span>Longitude</span>
                                        <strong>
                                            ${longitudeValue.toFixed(6)}
                                        </strong>
                                    </div>

                                </div>

                            `
                            : ""
                        }

                        <button
                            class="again-btn"
                            onclick="resetPrediction()">

                            🔄 Check Again

                        </button>

                    </div>
                `;

                // ==================================================
                // RISK ALERT
                // ==================================================

                showRiskAlert(data);

                // ==================================================
                // RELOAD HISTORY
                // ==================================================

                await loadHistory();

            }

            catch (error) {

                console.error(
                    "Prediction Error:",
                    error
                );

                result.innerHTML = `

                    <div class="warning-box">

                        ❌ Unable to connect to AI server.

                        <br><br>

                        Make sure Flask is running at:

                        <br>

                        <strong>
                            ${API_BASE_URL}
                        </strong>

                        <br><br>

                        <small>
                            ${error.message}
                        </small>

                    </div>
                `;
            }

        }
    );
}

// ======================================================
// RISK ALERT SYSTEM
// ======================================================

function showRiskAlert(data) {

    const banner =
        document.getElementById(
            "alertBanner"
        );

    const icon =
        document.getElementById(
            "alertIcon"
        );

    const title =
        document.getElementById(
            "alertTitle"
        );

    const message =
        document.getElementById(
            "alertMessage"
        );

    const details =
        document.getElementById(
            "alertDetails"
        );

    if (!banner) {
        return;
    }

    const risk =
        String(
            data.risk || "LOW"
        ).toUpperCase();

    const probability =
        Number(
            data.landslide_probability || 0
        ).toFixed(2);

    banner.classList.remove(
        "alert-high",
        "alert-medium",
        "alert-low"
    );

    if (risk === "HIGH") {

        banner.classList.add(
            "alert-high"
        );

        if (icon) {
            icon.textContent = "🚨";
        }

        if (title) {
            title.textContent =
                "LANDSLIDE WARNING";
        }

        if (message) {
            message.textContent =
                "High landslide risk detected. Immediate caution is advised.";
        }

        if (details) {
            details.textContent =
                `Landslide Probability: ${probability}%`;
        }

        setTimeout(function () {

            window.alert(

                "🚨 LANDSLIDE WARNING\n\n" +
                "High landslide risk detected.\n" +
                `Landslide Probability: ${probability}%\n\n` +
                "Please take immediate caution."

            );

        }, 200);
    }

    else if (risk === "MEDIUM") {

        banner.classList.add(
            "alert-medium"
        );

        if (icon) {
            icon.textContent = "⚠️";
        }

        if (title) {
            title.textContent =
                "CAUTION ADVISED";
        }

        if (message) {
            message.textContent =
                "Moderate landslide risk detected. Stay alert and monitor conditions.";
        }

        if (details) {
            details.textContent =
                `Landslide Probability: ${probability}%`;
        }
    }

    else {

        banner.classList.add(
            "alert-low"
        );

        if (icon) {
            icon.textContent = "✅";
        }

        if (title) {
            title.textContent =
                "LOW RISK";
        }

        if (message) {
            message.textContent =
                "Current environmental conditions appear relatively safe.";
        }

        if (details) {
            details.textContent =
                `Landslide Probability: ${probability}%`;
        }
    }

    banner.classList.remove(
        "hidden"
    );
}

// ======================================================
// CLOSE ALERT
// ======================================================

function closeRiskAlert() {

    const banner =
        document.getElementById(
            "alertBanner"
        );

    if (banner) {

        banner.classList.add(
            "hidden"
        );
    }
}

// ======================================================
// RESET PREDICTION
// ======================================================

function resetPrediction() {

    const result =
        document.getElementById(
            "result"
        );

    if (result) {

        result.innerHTML = `

            <p class="result-message">
                Enter environmental data to check landslide risk.
            </p>

        `;
    }

    const rainfall =
        document.getElementById("rainfall");

    const slope =
        document.getElementById("slope");

    const soil =
        document.getElementById("soil");

    if (rainfall) {
        rainfall.value = "";
    }

    if (slope) {
        slope.value = "";
    }

    if (soil) {
        soil.value = "";
    }

    if (latitudeInput) {
        latitudeInput.value = "";
    }

    if (longitudeInput) {
        longitudeInput.value = "";
    }

    if (locationStatus) {

        locationStatus.textContent = "";

        locationStatus.className =
            "location-status";
    }

    closeRiskAlert();

    if (rainfall) {
        rainfall.focus();
    }
}

// ======================================================
// LOAD HISTORY
// ======================================================

async function loadHistory() {

    const tableBody =
        document.getElementById(
            "historyTableBody"
        );

    if (!tableBody) {
        return;
    }

    try {

        tableBody.innerHTML = `

            <tr>

                <td colspan="8">
                    🔄 Loading prediction history...
                </td>

            </tr>

        `;

        console.log(
            "Loading history from Flask..."
        );

        const response =
            await fetch(
                `${API_BASE_URL}/history`
            );

        console.log(
            "History response status:",
            response.status
        );

        const text =
            await response.text();

        let data;

        try {

            data =
                JSON.parse(text);

        }

        catch (error) {

            throw new Error(
                "Flask returned invalid history response."
            );
        }

        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Failed to load history"
            );
        }

        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="8">
                        📭 No prediction history available.
                    </td>

                </tr>

            `;

            updateAnalytics([]);

            updatePredictionChart([]);

            updateRiskChart([]);

            return;
        }

        updateAnalytics(data);

        updatePredictionChart(data);

        updateRiskChart(data);

        tableBody.innerHTML = "";

        data.forEach(record => {

            let riskClass = "";

            if (record.risk === "LOW") {
                riskClass = "risk-low";
            }

            else if (record.risk === "MEDIUM") {
                riskClass = "risk-medium";
            }

            else if (record.risk === "HIGH") {
                riskClass = "risk-high";
            }

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>
                    #${record.id}
                </td>

                <td>
                    ${Number(
                        record.rainfall
                    ).toFixed(2)} mm
                </td>

                <td>
                    ${Number(
                        record.slope
                    ).toFixed(2)}°
                </td>

                <td>
                    ${Number(
                        record.soil_saturation
                    ).toFixed(2)}%
                </td>

                <td>
                    ${Number(
                        record.landslide_probability
                    ).toFixed(2)}%
                </td>

                <td>
                    ${Number(
                        record.no_landslide_probability
                    ).toFixed(2)}%
                </td>

                <td>
                    <span class="${riskClass}">
                        ${record.risk}
                    </span>
                </td>

                <td>
                    ${record.created_at}
                </td>

            `;

            tableBody.appendChild(row);

        });

    }

    catch (error) {

        console.error(
            "History Error:",
            error
        );

        tableBody.innerHTML = `

            <tr>

                <td colspan="8">

                    ❌ Unable to load prediction history.

                    <br>

                    <small>
                        ${error.message}
                    </small>

                </td>

            </tr>

        `;
    }
}

// ======================================================
// ANALYTICS
// ======================================================

function updateAnalytics(data) {

    let total =
        data.length;

    let low = 0;
    let medium = 0;
    let high = 0;

    data.forEach(record => {

        if (record.risk === "LOW") {
            low++;
        }

        else if (record.risk === "MEDIUM") {
            medium++;
        }

        else if (record.risk === "HIGH") {
            high++;
        }

    });

    const totalElement =
        document.getElementById(
            "totalPredictions"
        );

    const lowElement =
        document.getElementById(
            "lowPredictions"
        );

    const mediumElement =
        document.getElementById(
            "mediumPredictions"
        );

    const highElement =
        document.getElementById(
            "highPredictions"
        );

    if (totalElement) {
        totalElement.textContent =
            total;
    }

    if (lowElement) {
        lowElement.textContent =
            low;
    }

    if (mediumElement) {
        mediumElement.textContent =
            medium;
    }

    if (highElement) {
        highElement.textContent =
            high;
    }

    const riskLow =
        document.getElementById(
            "riskLowCount"
        );

    const riskMedium =
        document.getElementById(
            "riskMediumCount"
        );

    const riskHigh =
        document.getElementById(
            "riskHighCount"
        );

    if (riskLow) {
        riskLow.textContent =
            low;
    }

    if (riskMedium) {
        riskMedium.textContent =
            medium;
    }

    if (riskHigh) {
        riskHigh.textContent =
            high;
    }
}

// ======================================================
// PREDICTION CHART
// ======================================================

function updatePredictionChart(data) {

    const canvas =
        document.getElementById(
            "predictionChart"
        );

    if (!canvas) {
        return;
    }

    if (predictionChart) {

        predictionChart.destroy();

        predictionChart = null;
    }

    if (
        !data ||
        data.length === 0
    ) {
        return;
    }

    const labels =
        data.map(
            record =>
                `Prediction #${record.id}`
        );

    const rainfallData =
        data.map(
            record =>
                Number(
                    record.rainfall
                )
        );

    const probabilityData =
        data.map(
            record =>
                Number(
                    record.landslide_probability
                )
        );

    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js is not loaded."
        );

        return;
    }

    predictionChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Rainfall (mm)",

                            data:
                                rainfallData,

                            borderWidth: 3,

                            tension: 0.4,

                            fill: false,

                            yAxisID: "y"
                        },

                        {

                            label:
                                "Landslide Probability (%)",

                            data:
                                probabilityData,

                            borderWidth: 3,

                            tension: 0.4,

                            fill: false,

                            yAxisID: "y1"
                        }

                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        mode: "index",

                        intersect: false
                    },

                    plugins: {

                        legend: {

                            display: true,

                            labels: {

                                color:
                                    "#dbeafe",

                                font: {

                                    size: 14,

                                    weight:
                                        "600"
                                }
                            }
                        }
                    },

                    scales: {

                        x: {

                            ticks: {

                                color:
                                    "#9fb3c8"
                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,0.05)"
                            }
                        },

                        y: {

                            beginAtZero: true,

                            title: {

                                display: true,

                                text:
                                    "Rainfall (mm)",

                                color:
                                    "#9fb3c8"
                            },

                            ticks: {

                                color:
                                    "#9fb3c8"
                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,0.05)"
                            }
                        },

                        y1: {

                            beginAtZero: true,

                            max: 100,

                            position: "right",

                            title: {

                                display: true,

                                text:
                                    "Landslide Probability (%)",

                                color:
                                    "#9fb3c8"
                            },

                            ticks: {

                                color:
                                    "#9fb3c8"
                            },

                            grid: {

                                drawOnChartArea:
                                    false
                            }
                        }
                    }
                }
            }
        );
}

// ======================================================
// RISK DISTRIBUTION CHART
// ======================================================

function updateRiskChart(data) {

    const canvas =
        document.getElementById(
            "riskChart"
        );

    if (!canvas) {
        return;
    }

    if (riskChart) {

        riskChart.destroy();

        riskChart = null;
    }

    let low = 0;
    let medium = 0;
    let high = 0;

    data.forEach(record => {

        if (record.risk === "LOW") {
            low++;
        }

        else if (record.risk === "MEDIUM") {
            medium++;
        }

        else if (record.risk === "HIGH") {
            high++;
        }

    });

    const riskLow =
        document.getElementById(
            "riskLowCount"
        );

    const riskMedium =
        document.getElementById(
            "riskMediumCount"
        );

    const riskHigh =
        document.getElementById(
            "riskHighCount"
        );

    if (riskLow) {
        riskLow.textContent =
            low;
    }

    if (riskMedium) {
        riskMedium.textContent =
            medium;
    }

    if (riskHigh) {
        riskHigh.textContent =
            high;
    }

    if (
        low === 0 &&
        medium === 0 &&
        high === 0
    ) {
        return;
    }

    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js is not loaded."
        );

        return;
    }

    riskChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: [

                        "LOW RISK",
                        "MEDIUM RISK",
                        "HIGH RISK"

                    ],

                    datasets: [

                        {

                            data: [

                                low,
                                medium,
                                high

                            ],

                            backgroundColor: [

                                "#38a9e8",
                                "#ffcc33",
                                "#ff4d6d"

                            ],

                            borderColor:
                                "#0d1d30",

                            borderWidth: 3,

                            hoverOffset: 8
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    cutout: "62%",

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                color:
                                    "#dbeafe",

                                padding: 14,

                                boxWidth: 38,

                                boxHeight: 12,

                                font: {

                                    size: 13,

                                    weight:
                                        "600"
                                }
                            }
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (context) {

                                        const total =
                                            context.dataset.data.reduce(
                                                (a, b) =>
                                                    a + b,
                                                0
                                            );

                                        const value =
                                            Number(
                                                context.raw
                                            );

                                        const percentage =
                                            total > 0
                                                ? (
                                                    value /
                                                    total *
                                                    100
                                                ).toFixed(1)
                                                : 0;

                                        return `${context.label}: ${value} Predictions (${percentage}%)`;
                                    }
                            }
                        }
                    }
                }
            }
        );
}

// ======================================================
// TEST BACKEND CONNECTION
// ======================================================

async function checkBackendConnection() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/health`
            );

        const data =
            await response.json();

        console.log(
            "Backend Health:",
            data
        );

        return true;

    }

    catch (error) {

        console.error(
            "Backend connection failed:",
            error
        );

        return false;
    }
}

// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Landslide Warning System frontend loaded."
        );

        await checkBackendConnection();

        await loadHistory();

    }
);