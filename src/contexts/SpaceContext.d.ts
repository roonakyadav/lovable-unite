interface SpaceContextType {
    spaceId: string | null;
    spaceName: string | null;
    partnerId: string | null;
    partnerName: string | null;
    loading: boolean;
    refreshSpace: () => Promise<void>;
}
export declare const SpaceProvider: ({ children }: {
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useSpace: () => SpaceContextType;
export {};
