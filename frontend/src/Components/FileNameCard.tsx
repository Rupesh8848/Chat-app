import React from "react";
import { FileUploadProgressTrackerType } from "../Routes/PublicChat";
import { Line } from "rc-progress";
import { GiCancel, GiPauseButton, GiPlayButton } from "react-icons/gi";

export default function FileNameCard({
  fileName,
  filesUploadProgress,
  setFiles,
  setUploadFileProgress,
}: {
  fileName: string;
  filesUploadProgress: FileUploadProgressTrackerType | undefined;
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
  setUploadFileProgress: React.Dispatch<
    React.SetStateAction<FileUploadProgressTrackerType | undefined>
  >;
}) {
  return (
    <div className="h-min border-[1px] mt-2  flex-col items-center py-2 px-1 relative">
      <div>
        <div className="font-bold">{fileName}</div>
        {filesUploadProgress && (
          <p className="font-bold">
            {filesUploadProgress[fileName].progress
              .toLocaleString()
              .slice(0, 5)}
            %
          </p>
        )}
        {filesUploadProgress && filesUploadProgress[fileName].progress && (
          <div className="absolute top-[10px] right-[20px] flex ">
            {filesUploadProgress[fileName].snapshot.state === "paused" ? (
              <div
                onClick={() =>
                  filesUploadProgress[fileName].snapshot.task.resume()
                }
                className="hover:bg-gray-500 mr-2 rounded-full p-[.25rem]  cursor-pointer"
              >
                <GiPlayButton size={20} />
              </div>
            ) : (
              <div
                onClick={() =>
                  filesUploadProgress[fileName].snapshot.task.pause()
                }
                className="hover:bg-gray-500 mr-2 rounded-full p-[.25rem]  cursor-pointer"
              >
                <GiPauseButton size={20} />
              </div>
            )}

            <div
              onClick={() => {
                filesUploadProgress[fileName].snapshot.task.cancel();
                setFiles((allFiles) => {
                  if (allFiles?.length === 1) {
                    return null;
                  } else {
                    return (
                      allFiles?.filter(
                        (fileToUpload) => fileToUpload.name !== fileName
                      ) || null
                    );
                  }
                });
                setUploadFileProgress((allProgress) => {
                  if (allProgress && Object.keys(allProgress).length > 1) {
                    delete allProgress[fileName];
                    return allProgress;
                  } else {
                    return undefined;
                  }
                });
              }}
              className="hover:bg-gray-500  cursor-pointer rounded-full p-[.25rem]"
            >
              <GiCancel size={20} />
            </div>
          </div>
        )}
      </div>

      {filesUploadProgress && (
        <Line
          percent={filesUploadProgress[fileName].progress}
          strokeWidth={2}
          strokeColor="#39bd41"
        />
      )}
    </div>
  );
}
