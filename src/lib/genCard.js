const { JSX, Builder, loadImage } = require("canvacord");

class GreetingsCard extends Builder {
  constructor() {
    super(930, 260);
    this.bootstrap({
      serverCount: "",
      totalMembers: "",
      latency: "",
    });
  }

  serverCount(value) {
    this.options.set("serverCount", value);
    return this;
  }

  totalMembers(value) {
    this.options.set("totalMembers", value);
    return this;
  }

  latency(value) {
    this.options.set("latency", value);
    return this;
  }

  async render() {
    const { serverCount, totalMembers, latency } = this.options.getOptions();

    return JSX.createElement(
      "div",
      {
        className:
          "h-full w-full flex flex-col items-center justify-center bg-[#23272A] rounded-xl",
      },
      JSX.createElement(
        "div",
        {
          className:
            "h-[35%] w-full flex flex-row items-center justify-start pl-5 border-b-white border-2",
        },
        JSX.createElement(
          "h1",
          {
            className: "text-5xl text-white m-0",
          },
          "Bot Stats"
        )
      ),
      JSX.createElement(
        "div",
        {
          className:
            "h-full flex-1 w-full flex flex-row items-center justify-start pl-4",
        },

        JSX.createElement(
          "div",
          {
            className:
              "h-full flex-1 w-full flex-1 flex flex-col items-center justify-center",
          },
          JSX.createElement(
            "h1",
            {
              className: "text-4xl text-white p-0 m-0 mb-2",
            },
            "Server Count:"
          ),
          JSX.createElement(
            "h1",
            {
              className: "text-4xl text-white p-0 m-0",
            },
            serverCount
          )
        ),

        JSX.createElement(
          "div",
          {
            className:
              "h-full flex-1 w-full flex-1 flex flex-col items-center justify-center",
          },
          JSX.createElement(
            "h1",
            {
              className: "text-4xl text-white p-0 m-0 mb-2",
            },
            "Total Members:"
          ),
          JSX.createElement(
            "h1",
            {
              className: "text-4xl text-white p-0 m-0",
            },
            totalMembers
          )
        ),

        JSX.createElement(
          "div",
          {
            className:
              "h-full flex-1 w-full flex-1 flex flex-col items-center justify-center",
          },
          JSX.createElement(
            "h1",
            {
              className: "text-4xl text-white p-0 m-0 mb-2",
            },
            "Latency:"
          ),
          JSX.createElement(
            "h1",
            {
              className: "text-4xl text-white p-0 m-0",
            },
            latency
          )
        )
      )
    );
  }
}

module.exports = { GreetingsCard };
