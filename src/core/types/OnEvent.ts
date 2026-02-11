import { RawData } from "ws";
import { ClientRequest, IncomingMessage } from "http";

export type OnHandler =
    | {
          event: "close";
          listener: (
              webSocket: WebSocket,
              code: number,
              reason: Buffer
          ) => void;
      }
    | {
          event: "error";
          listener: (webSocket: WebSocket, error: Error) => void;
      }
    | {
          event: "upgrade";
          listener: (webSocket: WebSocket, request: IncomingMessage) => void;
      }
    | {
          event: "message";
          listener: (
              webSocket: WebSocket,
              data: RawData,
              isBinary: boolean
          ) => void;
      }
    | {
          event: "open";
          listener: (webSocket: WebSocket) => void;
      }
    | {
          event: "ping" | "pong";
          listener: (webSocket: WebSocket, data: Buffer) => void;
      }
    | {
          event: "redirect";
          listener: (
              webSocket: WebSocket,
              url: string,
              request: ClientRequest
          ) => void;
      }
    | {
          event: "unexpected-response";
          listener: (
              webSocket: WebSocket,
              url: string,
              request: ClientRequest
          ) => void;
      }
    | {
          event: string | symbol;
          listener: (webSocket: WebSocket, ...args: any[]) => void;
      };

export type OnFunctionParam =
    | ["close", (webSocket: WebSocket, code: number, reason: Buffer) => void]
    | ["error", (webSocket: WebSocket, error: Error) => void]
    | ["upgrade", (webSocket: WebSocket, request: IncomingMessage) => void]
    | [
          "message",
          (webSocket: WebSocket, data: RawData, isBinary: boolean) => void
      ]
    | ["open", (webSocket: WebSocket) => void]
    | ["ping" | "pong", (webSocket: WebSocket, data: Buffer) => void]
    | [
          "redirect",
          (webSocket: WebSocket, url: string, request: ClientRequest) => void
      ]
    | [
          "unexpected-response",
          (webSocket: WebSocket, url: string, request: ClientRequest) => void
      ]
    | [string | symbol, (webSocket: WebSocket, ...args: any[]) => void];
