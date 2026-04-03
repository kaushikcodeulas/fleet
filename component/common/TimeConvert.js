function formatDateTime(dateString) {
    const date = new Date(dateString);

    const day = date.getDate();

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];

    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12

    return `${day} ${month}, ${year} ${hours}:${minutes}${ampm}`;
}

const TimeConvert = ({ time }) => {
    return formatDateTime(time);
}

export default TimeConvert