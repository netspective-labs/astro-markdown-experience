import * as fs from "node:fs";
import * as path from "node:path";

export interface CopyFileIfNewerEffects {
    readonly onStatError?: (err: NodeJS.ErrnoException, srcPath: string, destPath: string) => void;
    readonly onEnsureDestDirError?: (err: NodeJS.ErrnoException, destPath: string, srcPath: string) => void;
    readonly onCopyNotRequired?: (srcPath: string, destPath: string) => void;
    readonly onCopied?: (srcPath: string, destPath: string) => void;
}

export function copyFileIfNewerMemoizeEffects(): CopyFileIfNewerEffects & {
    destDirErrors: Map<string, NodeJS.ErrnoException>;
    memoized: Map<string, {
        copied: string[];
        notRequired: string[];
        statError: NodeJS.ErrnoException[];
    }>
} {
    const destDirErrors = new Map<string, NodeJS.ErrnoException>();
    const memoized = new Map<string, {
        copied: string[];
        notRequired: string[];
        statError: NodeJS.ErrnoException[];
    }>();
    const memoizedEntry = (key: string) => {
        let result = memoized.get(key);
        if(result) return result;
        result = {
            copied: [],
            notRequired: [],
            statError: []
        }
        memoized.set(key, result);
        return result;
    }
    return {
        destDirErrors, 
        memoized,
        onEnsureDestDirError: (err: NodeJS.ErrnoException, destPath: string) => {
            destDirErrors.set(destPath, err);
        },
        onStatError: (err: NodeJS.ErrnoException, srcPath: string) => {
            memoizedEntry(srcPath)?.statError.push(err);
        },
        onCopyNotRequired: (srcPath: string, destPath: string) => {
            memoizedEntry(srcPath)?.notRequired.push(destPath);
        },
        onCopied: (srcPath: string, destPath: string) => {
            memoizedEntry(srcPath)?.copied.push(destPath);
        },
    }
}

export function copyFileIfNewer(
    srcPath: string,
    destPath: string,
    effects?: CopyFileIfNewerEffects
) {
    return fs.stat(srcPath, (err, srcStats) => {
        if (err) {
            return effects?.onStatError?.(err, srcPath, destPath);
        }

        fs.stat(destPath, (err, destStats) => {
            if (!err && srcStats.mtime <= destStats.mtime) {
                // Source file is not newer than the destination file, so don't copy it
                return effects?.onCopyNotRequired?.(srcPath, destPath);
            }

            const destDir = path.dirname(destPath);
            fs.mkdir(destDir, { recursive: true }, (err) => {
                if (err && err.code !== 'EEXIST') {
                    return effects?.onEnsureDestDirError?.(err, srcPath, destPath);
                }

                const srcStream = fs.createReadStream(srcPath);
                const destStream = fs.createWriteStream(destPath);
                srcStream.pipe(destStream);
                destStream.on('close', () => {
                    effects?.onCopied?.(srcPath, destPath);
                });
            });
        });
    });
}
