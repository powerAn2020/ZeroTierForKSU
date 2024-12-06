import { exec, spawn } from 'kernelsu';
import {Buffer} from 'buffer'
export const MODDIR = '/data/adb/modules/ZeroTierForKSU'
export const ZTPATH = '/data/adb/zerotier'

export const execCmd = async (cmd) => {
  console.info(cmd)
  const {errno, stdout,stderr} = await exec(cmd, {cwd: '/'})
  if (errno === 0) {
      // success
      console.log(stdout)
      return stdout
  }else {
    console.error(stderr)
  }
}
// console.info(moduleInfo())
export const execCmdWithErrno = async (cmd) => {
  console.info(cmd)
  const { errno, stdout, stderr} = await exec(cmd, { cwd: '/' });
  if (errno === 0) {
    // success
    console.log(stdout);
  } else {
    console.error(stderr)
  }
  return errno;
}

export const execCmdWithCallback = async ({cmd, options = { cwd: '/' }, onSuccess, onError}) => {
  console.info(cmd)
  const { errno, stdout, stderr } = await exec(cmd, options);
  if (errno === 0) {
    console.log(stdout);
    // success
    if (onSuccess) {
      onSuccess(stdout);
    }
  } else {
    console.error(stderr)
    if (onError) {
      onError(stderr);
    }
  }
}

export const spawnCmdWithCallback = ({cmd, args = [], onSuccess, onError}) => {
  console.info(cmd)
  const childProcess = spawn(cmd, args);
  childProcess.stdout.on('data', (data) => {
    console.log(data);
    if (onSuccess) {
      onSuccess(data);
    }
  });
  childProcess.stderr.on('data', (data) => {
    console.log(data);
    if (onError) {
      onError(data);
    }
  });
  childProcess.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

export const readFile = async (filePath) => {
  return Buffer.from(await execCmd(`base64 -w 0 ${filePath}`), "base64").toString('utf-8');
}

export const saveFile = (content, filePath) => {
  return execCmd(`echo ${Buffer.from(content).toString("base64")} | base64 -d > ${filePath}`);
}