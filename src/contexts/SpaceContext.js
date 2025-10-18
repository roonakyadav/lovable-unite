import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../Integrations/supabase/client";
import { useAuth } from "./AuthContext";
const SpaceContext = createContext(undefined);
export const SpaceProvider = ({ children }) => {
    const { user } = useAuth();
    const [spaceId, setSpaceId] = useState(null);
    const [spaceName, setSpaceName] = useState(null);
    const [partnerId, setPartnerId] = useState(null);
    const [partnerName, setPartnerName] = useState(null);
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
                const space = membershipData.spaces;
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
                    const partner = partnerData.profiles;
                    setPartnerId(partner.id);
                    setPartnerName(partner.name);
                }
            }
        }
        catch (error) {
            console.error("Error in fetchSpace:", error);
        }
        finally {
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
    return (_jsx(SpaceContext.Provider, { value: { spaceId, spaceName, partnerId, partnerName, loading, refreshSpace }, children: children }));
};
export const useSpace = () => {
    const context = useContext(SpaceContext);
    if (context === undefined) {
        throw new Error("useSpace must be used within a SpaceProvider");
    }
    return context;
};
