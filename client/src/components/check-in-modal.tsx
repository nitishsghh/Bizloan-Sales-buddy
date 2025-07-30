import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Clock } from "lucide-react";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckInModal({ isOpen, onClose }: CheckInModalProps) {
  const [location, setLocation] = useState<{ latitude?: number; longitude?: number; address?: string }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: async (checkInData: any) => {
      const response = await apiRequest("POST", "/api/checkins", checkInData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Check-in successful",
        description: "You have been checked in successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/checkins/active"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: "Current Location", // In a real app, you'd reverse geocode this
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocation({
            address: "Location unavailable",
          });
        }
      );
    } else {
      setLocation({
        address: "Geolocation not supported",
      });
    }
  };

  const handleCheckIn = () => {
    const checkInData = {
      location: location.address || "Unknown location",
      latitude: location.latitude?.toString(),
      longitude: location.longitude?.toString(),
    };
    
    checkInMutation.mutate(checkInData);
  };

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Get location when modal opens
  useState(() => {
    if (isOpen && !location.address) {
      getCurrentLocation();
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-white h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Check In</h3>
          <p className="text-sm text-gray-500 mt-2">Confirm your location to check in</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <MapPin className="text-primary h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-gray-800">Current Location</p>
                <p className="text-xs text-gray-500">
                  {location.address || "Getting location..."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Clock className="text-primary h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-gray-800">Check In Time</p>
                <p className="text-xs text-gray-500">{currentTime}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onClose}
            disabled={checkInMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={handleCheckIn}
            disabled={checkInMutation.isPending}
          >
            {checkInMutation.isPending ? "Checking in..." : "Confirm Check In"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
