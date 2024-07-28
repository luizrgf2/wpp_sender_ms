import { ConfigInterfaceDTO } from "./config.interface";

export interface CacheInterface {
    setConfig(config: ConfigInterfaceDTO): Promise<void>
    getConfig(): Promise<ConfigInterfaceDTO>
}