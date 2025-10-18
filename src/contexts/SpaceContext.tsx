import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../Integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface SpaceContextType {
    spaceId: string | null;
    spaceName: string | null;
    partnerId: string | null;
    partnerName: string | null;
    loading: boolean;
    refreshSpace: () => Promise<void>;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const SpaceProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [spaceId, setSpaceId] = useState<string | null>(null);
    const [spaceName, setSpaceName] = useState<string | null>(null);
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [partnerName, setPartnerName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSpace = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            // Get user's space membership
            const { data: membershipData, error: membershipError } = await supabase
                .from("space_members")
                .select("space_id, spaces(id, name)")
                .eq("user_id", user.id)
                .single();

            if (membershipError) {
                console.error("Error fetching space:", membershipError);
                setLoading(false);
                return;
            }

            if (membershipData) {
                const space = membershipData.spaces as any;
                setSpaceId(space.id);
                setSpaceName(space.name);

                // Get partner info
                const { data: partnerData } = await supabase
                    .from("space_members")
                    .select("user_id, profiles(id, name)")
                    .eq("space_id", space.id)
                    .neq("user_id", user.id)
                    .single();

                if (partnerData) {
                    const partner = partnerData.profiles as any;
                    setPartnerId(partner.id);
                    setPartnerName(partner.name);
                }
            }
        } catch (error) {
            console.error("Error in fetchSpace:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpace();
    }, [user, fetchSpace]);

    const refreshSpace = async () => {
        setLoading(true);
        await fetchSpace();
    };

    return (
        <SpaceContext.Provider value={{ spaceId, spaceName, partnerId, partnerName, loading, refreshSpace }}>
            {children}
        </SpaceContext.Provider>
    );
};

export const useSpace = () => {
    const context = useContext(SpaceContext);
    if (context === undefined) {
        throw new Error("useSpace must be used within a SpaceProvider");
    }
    return context;
};
